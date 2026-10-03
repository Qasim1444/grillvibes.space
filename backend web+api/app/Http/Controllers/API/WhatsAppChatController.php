<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\WhatsAppCall;
use App\Models\WhatsAppMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Server-side proxy to the WhatsApp API v2 server.
 *
 * The browser talks to these Laravel routes instead of hitting the WhatsApp
 * server directly — this avoids CORS issues and keeps the WhatsApp base URL
 * out of the frontend bundle.
 */
class WhatsAppChatController extends Controller
{
    private function baseUrl(): string
    {
        return rtrim(config('services.whatsapp.base_url'), '/');
    }

    /** Normalise a phone number to digits only (country code, no + or spaces). */
    private function normalizeNumber(?string $number): string
    {
        return preg_replace('/\D+/', '', (string) $number);
    }

    /**
     * Turn a media path into a browser-loadable absolute URL.
     *
     * The WhatsApp API returns media as a relative path (e.g.
     * "/media/received-XXXX.jpg"); prepend the WhatsApp host so the image
     * loads from that server instead of resolving against this app's domain.
     * URLs that are already absolute (http/https) are returned unchanged.
     */
    private function absoluteMediaUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }
        if (preg_match('#^https?://#i', $url)) {
            return $url;
        }

        return $this->baseUrl().'/'.ltrim($url, '/');
    }

    /**
     * Extract useful text from a message.
     *
     * The WhatsApp API prefixes media captions with a type label such as
     * "[Image] real caption" or "[Document: file.pdf]". We strip that label,
     * keep any real caption after it, and drop protocol/unsupported noise like
     * "[Unsupported: protocolMessage]".
     */
    private function cleanText(array $msg): ?string
    {
        // Prefer explicit caption over text field.
        $raw = $msg['caption'] ?? $msg['text'] ?? $msg['message'] ?? null;
        if ($raw === null || trim($raw) === '') {
            return null;
        }
        $raw = trim($raw);

        // Strip a leading "[Image]" / "[Document: file.pdf]" media label,
        // keeping whatever real caption follows it.
        $stripped = trim(preg_replace(
            '/^\[(image|photo|video|audio|voice|document|file|sticker|gif|media)(:[^\]]*)?\]\s*/i',
            '',
            $raw
        ));

        // Protocol / unsupported system messages carry no user content.
        if ($stripped === '' || preg_match('/^\[(unsupported|protocolmessage|messagecontextinfo|null)[^\]]*\]$/i', $stripped)) {
            return null;
        }

        return $stripped;
    }

    /** Per-request memo of resolved customer ids, keyed by trailing digits. */
    private array $customerIdCache = [];

    /** Find a customer id whose contact matches the digits-only number. */
    private function resolveCustomerId(string $number): ?int
    {
        if ($number === '') {
            return null;
        }

        // Match on the trailing digits so stored contacts with/without a
        // country code or with formatting still line up.
        $tail = substr($number, -10);

        // The message/call sync loops call this once per item and the same
        // number repeats often; memoise within the request so we don't re-run
        // the (non-indexable) contact scan for a number we've already resolved.
        if (array_key_exists($tail, $this->customerIdCache)) {
            return $this->customerIdCache[$tail];
        }

        return $this->customerIdCache[$tail] = Customer::query()
            ->whereRaw("REPLACE(REPLACE(REPLACE(REPLACE(contact,' ',''),'+',''),'-',''),'(','') LIKE ?", ['%'.$tail])
            ->value('id');
    }

    /**
     * Upsert one WhatsApp message into the local store, keyed by its WhatsApp id.
     * Returns silently on any failure so persistence never blocks the proxy.
     */
    private function storeMessage(array $msg): void
    {
        try {
            $waId = $msg['id'] ?? null;
            $number = $this->normalizeNumber(
                $msg['senderNumber'] ?? $msg['from'] ?? $msg['receiverNumber'] ?? null
            );
            if ($number === '') {
                return;
            }

            $attrs = [
                'number' => $number,
                'customer_id' => $this->resolveCustomerId($number),
                'direction' => $msg['direction'] ?? 'incoming',
                'message_type' => $msg['messageType'] ?? $msg['type'] ?? 'text',
                'text' => $this->cleanText($msg),
                'media_url' => $this->absoluteMediaUrl($msg['media']['url'] ?? (is_string($msg['media'] ?? null) ? $msg['media'] : null)),
                'media_mime' => $msg['media']['mimetype'] ?? null,
                'status' => $msg['status'] ?? null,
                'name' => $msg['name'] ?? null,
                'sent_at' => isset($msg['timestamp']) ? date('Y-m-d H:i:s', strtotime($msg['timestamp'])) : now(),
            ];

            if ($waId) {
                WhatsAppMessage::updateOrCreate(['wa_message_id' => $waId], $attrs);
            } else {
                WhatsAppMessage::create($attrs);
            }
        } catch (\Throwable $e) {
            // Persistence is best-effort; ignore.
        }
    }

    /** GET /whatsapp/status — connection + server state. */
    public function status(): JsonResponse
    {
        try {
            $res = Http::timeout(15)->get($this->baseUrl().'/status');

            return response()->json($res->json(), $res->status());
        } catch (\Throwable $e) {
            return response()->json([
                'connected' => false,
                'message' => $e->getMessage(),
            ], 200);
        }
    }

    /** GET /whatsapp/conversations — chat list with unread counts. */
    public function conversations(Request $request): JsonResponse
    {
        try {
            $res = Http::timeout(20)->get($this->baseUrl().'/conversations', [
                'limit' => $request->query('limit', 50),
            ]);

            return response()->json($res->json(), $res->status());
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }

    /** GET /whatsapp/messages/{number} — message thread for one number. */
    public function messages(Request $request, string $number): JsonResponse
    {
        $number = $this->normalizeNumber($number);
        $limit = (int) $request->query('limit', 100);

        try {
            $res = Http::timeout(20)->get($this->baseUrl().'/messages/'.$number, [
                'limit' => $request->query('limit', 100),
                'type' => $request->query('type'),
            ]);
            $body = $res->json();

            // Persist every message, and rewrite each media URL to an absolute
            // one so the browser loads it from the WhatsApp host, not this app.
            foreach (($body['messages'] ?? []) as $i => $msg) {
                $this->storeMessage($msg);
                if (! empty($msg['media']['url'])) {
                    $body['messages'][$i]['media']['url'] = $this->absoluteMediaUrl($msg['media']['url']);
                }
            }

            // When WhatsApp is not connected the live server still responds, but
            // with no history — fall back to the messages we've stored locally so
            // the thread keeps showing the past conversation.
            if (empty($body['messages'])) {
                return response()->json([
                    'success' => true,
                    'source' => 'db',
                    'messages' => $this->messagesFromDb($number, $limit),
                ], 200);
            }

            return response()->json($body, $res->status());
        } catch (\Throwable $e) {
            // WhatsApp server unreachable — serve the locally stored history.
            return response()->json([
                'success' => true,
                'source' => 'db',
                'messages' => $this->messagesFromDb($number, $limit),
            ], 200);
        }
    }

    /** Read stored messages for a number, newest first (matches WA API order). */
    private function messagesFromDb(string $number, int $limit = 100): array
    {
        return WhatsAppMessage::query()
            ->where('number', $number)
            ->orderByDesc('sent_at')
            ->limit($limit)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->wa_message_id,
                'senderNumber' => $m->number,
                'direction' => $m->direction,
                'messageType' => $m->message_type,
                'type' => $m->message_type,
                'text' => $m->text,
                'message' => $m->text,
                'media' => $m->media_url ? ['url' => $this->absoluteMediaUrl($m->media_url), 'mimetype' => $m->media_mime] : null,
                'status' => $m->status,
                'name' => $m->name,
                'timestamp' => optional($m->sent_at)->toIso8601String(),
            ])
            ->all();
    }

    /** POST /whatsapp/send-message — send a text message. */
    public function sendMessage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => 'required|string',
            'message' => 'required|string',
        ]);

        $number = $this->normalizeNumber($data['number']);
        if ($number === '') {
            return response()->json(['success' => false, 'message' => 'Invalid phone number.'], 422);
        }

        try {
            $res = Http::timeout(30)->post($this->baseUrl().'/send-message', [
                'number' => $number,
                'message' => $data['message'],
            ]);
            $body = $res->json();

            if (($body['success'] ?? false)) {
                $this->storeMessage([
                    'id' => $body['messageId'] ?? null,
                    'senderNumber' => $number,
                    'direction' => 'outgoing',
                    'messageType' => 'text',
                    'text' => $data['message'],
                    'status' => 'sent',
                    'timestamp' => now()->toIso8601String(),
                ]);
            }

            return response()->json($body, $res->status());
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * POST /whatsapp/send-image — send an image.
     * Accepts an uploaded file (multipart, field "file") or a public "url".
     */
    public function sendImage(Request $request): JsonResponse
    {
        return $this->dispatchMedia($request, 'image');
    }

    /**
     * POST /whatsapp/send-media — send any media type.
     * Accepts an uploaded file (multipart, field "file") or a public "url",
     * plus an optional "type" (image|video|audio|document|sticker). When the
     * type is omitted it is inferred from the file's MIME type / URL extension.
     */
    public function sendMedia(Request $request): JsonResponse
    {
        return $this->dispatchMedia($request, $request->input('type'));
    }

    /** WhatsApp media kinds we route to a dedicated /send-{kind} endpoint. */
    private const MEDIA_KINDS = ['image', 'video', 'audio', 'document', 'sticker'];

    /** Guess a media kind from a MIME type. */
    private function mediaKindForMime(?string $mime): string
    {
        $mime = strtolower((string) $mime);
        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }
        if (str_starts_with($mime, 'audio/')) {
            return 'audio';
        }

        return 'document';
    }

    /** Guess a media kind from a filename / URL extension. */
    private function mediaKindForExt(?string $ext): string
    {
        $ext = strtolower((string) $ext);
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'], true)) {
            return 'image';
        }
        if (in_array($ext, ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'], true)) {
            return 'video';
        }
        if (in_array($ext, ['mp3', 'ogg', 'opus', 'wav', 'm4a', 'aac', 'amr'], true)) {
            return 'audio';
        }

        return 'document';
    }

    /** Endpoint for a media kind: dedicated route when known, else /send-media. */
    private function mediaEndpoint(string $kind): string
    {
        return in_array($kind, self::MEDIA_KINDS, true) ? '/send-'.$kind : '/send-media';
    }

    /**
     * Shared proxy for the WhatsApp send-{image,video,audio,document,sticker}
     * and send-media endpoints. Keeps a local copy of uploaded files so the
     * outgoing message renders in the chat history.
     */
    private function dispatchMedia(Request $request, ?string $type): JsonResponse
    {
        $data = $request->validate([
            'number' => 'required|string',
            'caption' => 'nullable|string',
            'url' => 'nullable|url',
            'file' => 'nullable|file|max:102400', // 100 MB
        ]);

        $number = $this->normalizeNumber($data['number']);
        if ($number === '') {
            return response()->json(['success' => false, 'message' => 'Invalid phone number.'], 422);
        }

        // Only honour a valid, explicit type; otherwise infer it below.
        $kind = in_array($type, [...self::MEDIA_KINDS, 'media'], true) ? $type : null;

        $payload = ['number' => $number];
        if (! empty($data['caption'])) {
            $payload['caption'] = $data['caption'];
        }

        $localUrl = null; // public URL of the sent media, for chat display
        $mime = null;

        try {
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $mime = $file->getMimeType();
                $kind = $kind ?: $this->mediaKindForMime($mime);
                $path = $file->store('whatsapp', 'public');
                $localUrl = asset('storage/'.$path);

                $endpoint = $this->mediaEndpoint($kind);
                if ($endpoint === '/send-media') {
                    $payload['type'] = $kind === 'media' ? 'document' : $kind;
                }

                $res = Http::timeout(120)
                    ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                    ->post($this->baseUrl().$endpoint, $payload);
            } elseif (! empty($data['url'])) {
                $ext = pathinfo(parse_url($data['url'], PHP_URL_PATH) ?? '', PATHINFO_EXTENSION);
                $kind = $kind ?: $this->mediaKindForExt($ext);
                $localUrl = $data['url'];
                $payload['url'] = $data['url'];

                $endpoint = $this->mediaEndpoint($kind);
                if ($endpoint === '/send-media') {
                    $payload['type'] = $kind === 'media' ? 'document' : $kind;
                }

                $res = Http::timeout(120)->post($this->baseUrl().$endpoint, $payload);
            } else {
                return response()->json(['success' => false, 'message' => 'Provide a file or url.'], 422);
            }

            $body = $res->json();

            if (($body['success'] ?? false)) {
                $this->storeMessage([
                    'id' => $body['messageId'] ?? null,
                    'senderNumber' => $number,
                    'direction' => 'outgoing',
                    'messageType' => $kind ?: 'document',
                    'text' => $data['caption'] ?? null,
                    'media' => $localUrl ? ['url' => $localUrl, 'mimetype' => $mime] : null,
                    'status' => 'sent',
                    'timestamp' => now()->toIso8601String(),
                ]);
            }

            return response()->json($body, $res->status());
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }

    /**
     * Upsert one WhatsApp call into the local store, keyed by its WhatsApp id.
     * Resolves and stores the matching customer_id. Best-effort — never throws.
     */
    private function storeCall(array $call): void
    {
        try {
            $waId = $call['id'] ?? $call['callId'] ?? null;
            $number = $this->normalizeNumber(
                $call['from'] ?? $call['number'] ?? $call['callerJid'] ?? $call['peer'] ?? null
            );
            if ($number === '') {
                return;
            }

            $direction = strtolower((string) ($call['direction'] ?? $call['type'] ?? 'incoming'));
            $ts = $call['timestamp'] ?? $call['time'] ?? $call['date'] ?? $call['createdAt'] ?? null;

            $attrs = [
                'number' => $number,
                'customer_id' => $this->resolveCustomerId($number),
                'direction' => $direction === 'outgoing' ? 'outgoing' : 'incoming',
                'status' => $call['status'] ?? null,
                'is_video' => (bool) ($call['isVideo'] ?? $call['video'] ?? false),
                'caller_jid' => $call['callerJid'] ?? $call['from'] ?? null,
                'name' => $call['name'] ?? null,
                'call_time' => $ts ? date('Y-m-d H:i:s', strtotime($ts)) : now(),
            ];

            if ($waId) {
                WhatsAppCall::updateOrCreate(['wa_call_id' => $waId], $attrs);
            } else {
                // No stable id — dedupe on number + time so polling doesn't pile up rows.
                WhatsAppCall::updateOrCreate(
                    ['number' => $number, 'call_time' => $attrs['call_time']],
                    $attrs
                );
            }
        } catch (\Throwable $e) {
            // Persistence is best-effort; ignore.
        }
    }

    /** Read stored calls, newest first (matches the live API's ordering). */
    private function callsFromDb(?string $status, int $limit = 20): array
    {
        return WhatsAppCall::query()
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('call_time')
            ->limit($limit)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->wa_call_id,
                'callId' => $c->wa_call_id,
                'number' => $c->number,
                'from' => $c->caller_jid ?: $c->number,
                'callerJid' => $c->caller_jid,
                'direction' => $c->direction,
                'status' => $c->status,
                'isVideo' => (bool) $c->is_video,
                'name' => $c->name,
                'timestamp' => optional($c->call_time)->toIso8601String(),
            ])
            ->all();
    }

    /** GET /whatsapp/calls — recent calls (also persisted locally with customer_id). */
    public function calls(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $limit = (int) $request->query('limit', 20);

        // Circuit breaker: once the live server fails, serve calls from the DB
        // for a short cooldown instead of eating the connect timeout on every
        // poll — the Customers page hits this endpoint every few seconds.
        if ((int) Cache::get('wa_calls_down_until', 0) > time()) {
            return response()->json([
                'success' => true,
                'source' => 'db',
                'calls' => $this->callsFromDb($status, $limit),
            ], 200);
        }

        try {
            $res = Http::connectTimeout(4)->timeout(8)->get($this->baseUrl().'/calls', [
                'limit' => $request->query('limit', 20),
                'status' => $status,
            ]);
            $body = $res->json();

            // Persist every call so history + counts survive the live server going away.
            foreach (($body['calls'] ?? []) as $call) {
                $this->storeCall($call);
            }

            return response()->json($body, $res->status());
        } catch (\Throwable $e) {
            // Live server unreachable — open the breaker for 30s so the next
            // polls skip the timeout and serve locally stored calls instead.
            Cache::put('wa_calls_down_until', time() + 30, 30);

            return response()->json([
                'success' => true,
                'source' => 'db',
                'calls' => $this->callsFromDb($status, $limit),
            ], 200);
        }
    }

    /** POST /whatsapp/calls/{callId}/reject — reject an in-progress call. */
    public function rejectCall(Request $request, string $callId): JsonResponse
    {
        try {
            $res = Http::timeout(15)->post($this->baseUrl().'/calls/'.urlencode($callId).'/reject', [
                'callerJid' => $request->input('callerJid'),
            ]);

            // Reflect the rejection in the local store.
            WhatsAppCall::where('wa_call_id', $callId)->update(['status' => 'rejected']);

            return response()->json($res->json(), $res->status());
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 200);
        }
    }
}
