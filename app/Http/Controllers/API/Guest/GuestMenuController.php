<?php

namespace App\Http\Controllers\API\Guest;

use App\Http\Controllers\Controller;
use App\Models\DiningTable;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Place;
use App\Models\QrCode;
use App\Models\QrSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Public (unauthenticated) API powering:
 *  - QR dine-in ordering  → guest scans QR, gets a session, browses menu, places order
 *
 * All responses are JSON. No Sanctum token needed.
 * CSRF is not required for API routes (stateless by default in Laravel).
 */
class GuestMenuController extends Controller
{
    // ── QR Code scan ─────────────────────────────────────────────────────────

    /**
     * Resolve a QR slug → create/resume a guest session → return menu + session token.
     * GET /api/guest/qr/{slug}
     */
    public function scanQr(string $slug): JsonResponse
    {
        $qr = QrCode::where('slug', $slug)->where('is_active', true)->first();

        if (! $qr) {
            return response()->json(['error' => 'QR code not found or inactive.'], 404);
        }

        // Track scan stats
        $qr->increment('scan_count');
        $qr->update(['last_scanned_at' => now()]);

        // Create a fresh session (valid for 2 hours)
        $session = QrSession::create([
            'session_token'  => QrSession::generateToken(),
            'qr_code_id'     => $qr->id,
            'place_id'       => $qr->place_id,
            'dining_table_id'=> $qr->dining_table_id,
            'status'         => 'active',
            'expires_at'     => now()->addHours(2),
        ]);

        return response()->json([
            'session_token'   => $session->session_token,
            'place'           => $qr->place ? ['id' => $qr->place_id, 'name' => $qr->place->name] : null,
            'table'           => $qr->diningTable
                ? ['id' => $qr->dining_table_id, 'number' => $qr->diningTable->table_number]
                : null,
            'menu'            => $this->menuPayload($qr->place_id),
        ]);
    }

    // ── Menu ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/guest/menu?place_id=&session_token=
     * Returns full menu — callable without a session for pure browse.
     */
    public function menu(Request $request): JsonResponse
    {
        $placeId = $request->query('place_id');

        return response()->json([
            'menu' => $this->menuPayload($placeId),
        ]);
    }

    // ── Cart ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/guest/cart
     * Body: { session_token, cart: [{fooditems_id, quantity, note}] }
     * Saves the cart to the session (persists across page loads).
     */
    public function saveCart(Request $request): JsonResponse
    {
        $session = $this->resolveSession($request->input('session_token'));

        $data = $request->validate([
            'cart'                   => 'required|array',
            'cart.*.fooditems_id'    => 'required|integer|exists:food_items,id',
            'cart.*.quantity'        => 'required|integer|min:1',
            'cart.*.note'            => 'nullable|string|max:255',
        ]);

        // Enrich cart with current prices (never trust client-side prices)
        $ids   = collect($data['cart'])->pluck('fooditems_id')->unique();
        $items = FoodItem::whereIn('id', $ids)->where('status', 1)->get()->keyBy('id');

        $cart = collect($data['cart'])->map(function ($line) use ($items) {
            $item = $items->get($line['fooditems_id']);
            if (! $item) return null;

            return [
                'fooditems_id' => $item->id,
                'category_id'  => $item->foodcategory_id,
                'name'         => $item->name,
                'price'        => (float) $item->price,
                'quantity'     => (int) $line['quantity'],
                'note'         => $line['note'] ?? '',
            ];
        })->filter()->values();

        $session->update(['cart' => $cart->toArray()]);

        return response()->json([
            'cart'     => $cart,
            'subtotal' => $cart->sum(fn ($l) => $l['price'] * $l['quantity']),
        ]);
    }

    // ── Place Order ───────────────────────────────────────────────────────────

    /**
     * POST /api/guest/order
     * Body: { session_token, guest_name?, guest_phone?, order_type }
     * Creates the order from the saved cart, marks session as ordered.
     */
    public function placeOrder(Request $request): JsonResponse
    {
        $session = $this->resolveSession($request->input('session_token'));

        if (empty($session->cart)) {
            return response()->json(['error' => 'Cart is empty.'], 422);
        }

        $data = $request->validate([
            'session_token' => 'required|string',
            'guest_name'    => 'nullable|string|max:255',
            'guest_phone'   => 'nullable|string|max:50',
            'order_type'    => 'required|in:dining,on-way,delivery',
        ]);

        $cart = collect($session->cart);

        // Server-side price recompute
        $ids    = $cart->pluck('fooditems_id')->unique();
        $prices = FoodItem::whereIn('id', $ids)->where('status', 1)
                     ->pluck('price', 'id');

        $subtotal = $cart->sum(fn ($l) => ($prices[$l['fooditems_id']] ?? 0) * $l['quantity']);
        $qty      = $cart->sum('quantity');

        $order = DB::transaction(function () use ($data, $cart, $prices, $subtotal, $qty, $session) {
            $order = Order::create([
                'order_datetime'              => now(),
                'status'                      => 'pending',
                'paid'                        => false,
                'type'                        => $data['order_type'],
                'qty'                         => $qty,
                'subtotal'                    => round($subtotal, 2),
                'discount_type'               => 'amount',
                'discount_amount'             => 0,
                'service_charges'             => 0,
                'service_charges_percentage'  => 0,
                'grand_total'                 => round($subtotal, 2),
                'place_id'                    => $session->place_id,
            ]);

            foreach ($cart as $line) {
                $price = $prices[$line['fooditems_id']] ?? 0;

                // order_items stores the line total only — unit price is derived
                // as sub_total / quantity when an order is read back.
                $item = OrderItem::create([
                    'order_id'        => $order->id,
                    'fooditems_id'    => $line['fooditems_id'],
                    'category_id'     => $line['category_id'],
                    'quantity'        => $line['quantity'],
                    'discount_amount' => 0,
                    'sub_total'       => round($price * $line['quantity'], 2),
                    'add_note'        => $line['note'] ?? '',
                    'kds_status'      => 'new',
                    'kds_sent_at'     => now(),
                ]);

                // Auto-assign KDS station
                $station = \App\Models\KdsStation::resolveForItem($item->load('order'));
                if ($station) {
                    $item->update(['kds_station_id' => $station->id, 'kds_status' => 'sent']);
                }
            }

            // If placed from a QR at a specific table, mark table as occupied
            if ($session->dining_table_id) {
                DiningTable::where('id', $session->dining_table_id)
                    ->update(['status' => 'occupied', 'current_order_id' => $order->id]);
            }

            $session->update([
                'guest_name'  => $data['guest_name'] ?? null,
                'guest_phone' => $data['guest_phone'] ?? null,
                'order_id'    => $order->id,
                'status'      => 'ordered',
            ]);

            // Recipe -> ingredients -> stock deduction, and this order's COGS.
            // The branch is resolved from the table's place, since a QR order
            // never carries branch_id itself.
            app(\App\Services\StockConsumptionService::class)->consumeForOrder($order);

            return $order;
        });

        return response()->json([
            'order_id'     => $order->id,
            'order_number' => '#' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
            'grand_total'  => (float) $order->grand_total,
            'message'      => 'Order placed! Your kitchen has been notified.',
        ], 201);
    }

    /**
     * GET /api/guest/order-status/{orderId}
     * Poll the order status from the confirmation screen.
     */
    public function orderStatus(int $orderId): JsonResponse
    {
        $order = Order::select('id', 'status', 'paid', 'grand_total', 'order_datetime')
            ->findOrFail($orderId);

        return response()->json([
            'order_id'  => $order->id,
            'status'    => $order->status,
            'paid'      => (bool) $order->paid,
            'total'     => (float) $order->grand_total,
            'placed_at' => $order->order_datetime?->toIso8601String(),
        ]);
    }

    // ── QR Code management (admin) ────────────────────────────────────────────

    /**
     * Inertia page for managing QR codes.
     */
    public function qrIndex(Request $request): \Inertia\Response
    {
        $qrCodes = QrCode::with(['place:id,name', 'diningTable:id,table_number'])
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($q) => [
                ...$q->only('id', 'slug', 'label', 'is_active', 'scan_count', 'last_scanned_at'),
                'place_name' => $q->place?->name,
                'table'      => $q->diningTable?->table_number,
                'menu_url'   => $q->menuUrl(),
            ]);

        return \Inertia\Inertia::render('QRCodes', [
            'qrCodes' => $qrCodes,
            'places'  => Place::where('status', true)->orderBy('name')->get(['id', 'name']),
            'tables'  => DiningTable::where('is_active', true)->orderBy('table_number')
                            ->get(['id', 'table_number', 'place_id']),
        ]);
    }

    public function qrStore(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'place_id'        => 'nullable|exists:places,id',
            'dining_table_id' => 'nullable|exists:dining_tables,id',
            'label'           => 'nullable|string|max:100',
            'is_active'       => 'boolean',
        ]);

        QrCode::create([...$data, 'slug' => QrCode::generateSlug()]);

        return back()->with('success', 'QR code created.');
    }

    public function qrUpdate(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        $qr = QrCode::findOrFail($id);

        $data = $request->validate([
            'place_id'        => 'nullable|exists:places,id',
            'dining_table_id' => 'nullable|exists:dining_tables,id',
            'label'           => 'nullable|string|max:100',
            'is_active'       => 'boolean',
        ]);

        $qr->update($data);

        return back()->with('success', 'QR code updated.');
    }

    public function qrDestroy(int $id): \Illuminate\Http\RedirectResponse
    {
        QrCode::findOrFail($id)->delete();

        return back()->with('success', 'QR code deleted.');
    }

    /**
     * Render a saved QR code as an image — generated locally (milon/barcode),
     * so the menu URL is never sent to a third-party QR service.
     *   default        → crisp SVG for on-screen display and printing
     *   ?format=png    → PNG attachment for download (falls back to SVG if the
     *                    GD/Imagick extension is unavailable on the server)
     */
    public function qrImage(Request $request, int $id): \Illuminate\Http\Response
    {
        $qr = QrCode::findOrFail($id);
        $url = $qr->menuUrl();
        $generator = new \Milon\Barcode\DNS2D();
        $filename = 'qr-'.($qr->label ? Str::slug($qr->label) : $qr->slug);

        if ($request->query('format') === 'png') {
            $png = $generator->getBarcodePNG($url, 'QRCODE,M', 12, 12, [17, 24, 39], [255, 255, 255]);
            if ($png !== false) {
                return response(base64_decode($png), 200, [
                    'Content-Type' => 'image/png',
                    'Content-Disposition' => 'attachment; filename="'.$filename.'.png"',
                ]);
            }

            // No image extension on the host — hand back an SVG download instead.
            return response($generator->getBarcodeSVG($url, 'QRCODE,M', 8, 8), 200, [
                'Content-Type' => 'image/svg+xml',
                'Content-Disposition' => 'attachment; filename="'.$filename.'.svg"',
            ]);
        }

        return response($generator->getBarcodeSVG($url, 'QRCODE,M', 8, 8), 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function menuPayload(?int $placeId): array
    {
        $categories = FoodCategory::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $items = FoodItem::where('status', 1)
            ->orderBy('name')
            ->get(['id', 'foodcategory_id', 'name', 'description', 'price', 'image', 'code'])
            ->map(fn ($i) => [
                'id'          => $i->id,
                'category_id' => $i->foodcategory_id,
                'name'        => $i->name,
                'description' => $i->description,
                'price'       => (float) $i->price,
                'image'       => $i->image,
            ]);

        return ['categories' => $categories, 'items' => $items];
    }

    private function resolveSession(?string $token): QrSession
    {
        if (! $token) {
            throw ValidationException::withMessages(['session_token' => 'Session token required.']);
        }

        $session = QrSession::where('session_token', $token)
            ->where('status', 'active')
            ->first();

        if (! $session || $session->isExpired()) {
            throw ValidationException::withMessages(['session_token' => 'Session expired or not found.']);
        }

        return $session;
    }
}
