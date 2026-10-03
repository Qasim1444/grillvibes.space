<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use GdImage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Renders an order receipt to a PNG using PHP's GD extension (+ FreeType).
 *
 * This is a drop-in replacement for the previous Spatie\Browsershot flow,
 * which required Node.js / Puppeteer / Chromium on the host. Shared hosting
 * (e.g. Hostinger) has none of those, so Browsershot failed with
 * "sh: node: command not found" (exit code 127). GD ships with PHP and needs
 * no external binaries.
 *
 * The layout mirrors resources/views/receipts/order.blade.php.
 */
class ReceiptGenerator
{
    /** Canvas width in pixels (matches the old Browsershot windowSize width). */
    private const WIDTH = 400;

    /** Left/right/top/bottom padding. */
    private const PAD = 20;

    /** Column anchors (right edges) for the items table. */
    private const QTY_RIGHT = 275;

    private const PRICE_RIGHT = self::WIDTH - self::PAD; // 380

    private const ITEM_NAME_MAX_WIDTH = 205;             // wrap long item names

    /** Fallbacks used only until a business profile is saved in Settings. */
    private const CURRENCY = 'PKR';

    /**
     * Business identity for the receipt header/footer. Pulled from the Settings
     * module (Setting::first()) so the receipt, the printable HTML invoice and
     * the app all show the same name, logo, address and contact details.
     */
    private string $headerTitle;

    private string $addressLine;

    private string $phone;

    private string $footer;

    private string $salesAssociate;

    /** Absolute path or URL to the logo, or null to fall back to a text title. */
    private ?string $logoSource;

    private string $fontRegular;

    private string $fontBold;

    private GdImage $img;

    /** Current vertical cursor: the TOP of the next line to draw. */
    private float $y = 0.0;

    /** @var array<string,int> allocated colours */
    private array $c = [];

    public function __construct()
    {
        $this->fontRegular = storage_path('fonts/DejaVuSans.ttf');
        $this->fontBold = storage_path('fonts/DejaVuSans-Bold.ttf');

        if (! \extension_loaded('gd') || ! \function_exists('imagettftext')) {
            throw new RuntimeException('PHP GD with FreeType support is required to render receipts.');
        }

        foreach ([$this->fontRegular, $this->fontBold] as $font) {
            if (! is_file($font)) {
                throw new RuntimeException("Receipt font missing: {$font}");
            }
        }

        $s = Setting::first();

        $this->headerTitle = (string) ($s->company ?? $s->name ?? config('app.name'));
        $this->addressLine = (string) ($s->address ?? '');
        $this->phone = (string) ($s->phone ?? '');
        $this->footer = (string) ($s->message ?? ('Thank you for visiting '.$this->headerTitle));
        $this->salesAssociate = (string) ($s->name ?? $this->headerTitle);

        // Setting::logo is stored as "storage/logos/xxx" (relative to public/).
        $logo = $s?->logo;
        $this->logoSource = $logo ? public_path($logo) : null;
    }

    /**
     * Generate the receipt PNG for an order.
     *
     * @return array{path:string,relative:string,filename:string}
     */
    public function generate(Order $order): array
    {
        $order->loadMissing('orderItems.item', 'customer', 'sender');

        $filename = 'receipt_'.$order->id.'_'.time().'.png';
        $relative = 'receipts/'.$filename;
        $path = storage_path('app/public/'.$relative);

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        $this->draw($order, $path);

        return ['path' => $path, 'relative' => $relative, 'filename' => $filename];
    }

    private function draw(Order $order, string $path): void
    {
        $items = $order->orderItems;
        // Generous canvas; cropped to the real height before saving.
        $height = 560 + ($items->count() * 64);

        $this->img = imagecreatetruecolor(self::WIDTH, $height);
        imagealphablending($this->img, true);
        imagesavealpha($this->img, false);

        $this->c = [
            'white' => imagecolorallocate($this->img, 255, 255, 255),
            'dark' => imagecolorallocate($this->img, 33, 37, 41),
            'muted' => imagecolorallocate($this->img, 108, 117, 125),
            'green' => imagecolorallocate($this->img, 40, 167, 69),
            'red' => imagecolorallocate($this->img, 220, 53, 69),
            'dash' => imagecolorallocate($this->img, 206, 212, 218),
            'divider' => imagecolorallocate($this->img, 173, 181, 189),
        ];

        imagefilledrectangle($this->img, 0, 0, self::WIDTH, $height, $this->c['white']);

        $this->y = self::PAD;

        $this->drawHeader();
        $this->drawInfo($order);
        $this->drawItems($order);
        $this->drawTotals($order);
        $this->drawFooter();

        $finalHeight = (int) ceil($this->y + self::PAD);
        $cropped = imagecrop($this->img, [
            'x' => 0, 'y' => 0, 'width' => self::WIDTH, 'height' => $finalHeight,
        ]);
        if ($cropped !== false) {
            imagedestroy($this->img);
            $this->img = $cropped;
        }

        imagepng($this->img, $path);
        imagedestroy($this->img);
    }

    private function drawHeader(): void
    {
        $logo = $this->loadLogo();
        if ($logo instanceof GdImage) {
            $lw = imagesx($logo);
            $lh = imagesy($logo);
            $targetW = 100;
            $targetH = (int) round($lh * ($targetW / $lw));
            $x = (int) round((self::WIDTH - $targetW) / 2);
            imagecopyresampled($this->img, $logo, $x, (int) round($this->y), 0, 0, $targetW, $targetH, $lw, $lh);
            imagedestroy($logo);
            $this->y += $targetH + 10;
        } else {
            $this->centered($this->headerTitle, 20, $this->c['dark'], true);
            $this->y += 8;
        }

        if ($this->addressLine !== '') {
            foreach ($this->wrap($this->addressLine, self::WIDTH - (self::PAD * 2), 8.5) as $line) {
                $this->centered($line, 8.5, $this->c['muted']);
            }
        }
        if ($this->phone !== '') {
            $this->centered($this->phone, 8.5, $this->c['muted']);
        }
        $this->y += 10;
    }

    private function drawInfo(Order $order): void
    {
        $dt = $order->order_datetime instanceof Carbon
            ? $order->order_datetime
            : Carbon::parse((string) $order->order_datetime);

        $this->row('Invoice No:', 'INV-'.$order->id.'-'.$dt->timestamp, true);
        $this->row('OT:', (string) ($order->type ?? 'N/A'));
        $this->y += 6;

        $this->row('Date:', $dt->format('d/m/Y H:i'));
        $this->row("Sale's Associate:", $this->salesAssociate);
        $this->y += 6;

        $customer = $order->customer;
        $this->row('Customer:', (string) ($customer->name ?? 'Guest'));
        $this->row('Phone:', (string) ($customer->contact ?? 'N/A'));
        $this->wrappedRow('Address:', (string) ($customer->address ?? 'N/A'));
        $this->y += 8;
    }

    private function drawItems(Order $order): void
    {
        $this->hr($this->c['divider']);
        $this->y += 4;

        // Header row.
        $top = $this->y;
        $this->text(self::PAD, 'Items', 10, $this->c['dark'], true);
        $this->textRight(self::QTY_RIGHT, 'Qty', 10, $this->c['dark'], true);
        $this->textRight(self::PRICE_RIGHT, 'Price', 10, $this->c['dark'], true);
        $this->y = $top + $this->lineHeight(10);
        $this->hr($this->c['divider'], 2);
        $this->y += 6;

        foreach ($order->orderItems as $item) {
            $name = (string) ($item->item->name ?? 'Item');
            $lines = $this->wrap($name, self::ITEM_NAME_MAX_WIDTH, 10);

            $rowTop = $this->y;
            foreach ($lines as $i => $line) {
                $this->text(self::PAD, $line, 10, $this->c['dark']);
                if ($i < count($lines) - 1) {
                    $this->y += $this->lineHeight(10);
                }
            }
            // Qty + price align with the first line of the item name.
            $this->y = $rowTop;
            $this->textRight(self::QTY_RIGHT, (string) $item->quantity, 10, $this->c['dark']);
            $this->textRight(self::PRICE_RIGHT, $this->money($item->sub_total), 10, $this->c['dark']);

            $this->y = $rowTop + (count($lines) * $this->lineHeight(10)) + 4;
        }

        $this->y += 2;
        $this->textRight(self::PRICE_RIGHT, 'Total Items: '.$order->qty, 10, $this->c['dark'], true);
        $this->y += $this->lineHeight(10) + 4;
    }

    private function drawTotals(Order $order): void
    {
        $pct = rtrim(rtrim(number_format((float) $order->service_charges_percentage, 2, '.', ''), '0'), '.');

        $this->totalRow('Subtotal:', $this->money($order->subtotal), $this->c['dark']);
        $this->totalRow("Service Charges ({$pct}%):", '+'.$this->money($order->service_charges), $this->c['green']);
        $this->totalRow('Discount:', '-'.$this->money($order->discount_amount), $this->c['red']);
        $this->totalRow('Grand Total:', $this->money($order->grand_total), $this->c['dark'], true, 12);
    }

    private function drawFooter(): void
    {
        $this->y += 6;
        $this->hr($this->c['dash'], 1, true);
        $this->y += 8;
        $this->centered($this->footer, 9, $this->c['muted']);
    }

    /** Draw a label (left, muted) + value (right, dark) row and advance. */
    private function row(string $label, string $value, bool $boldValue = false): void
    {
        $top = $this->y;
        $this->text(self::PAD, $label, 10, $this->c['muted']);
        $this->textRight(self::PRICE_RIGHT, $value, 10, $this->c['dark'], $boldValue);
        $this->y = $top + $this->lineHeight(10);
    }

    /** Like row(), but the value wraps under the label when it is long. */
    private function wrappedRow(string $label, string $value): void
    {
        $labelW = $this->tw($label, 10) + 6;
        $maxW = (self::PRICE_RIGHT - self::PAD) - $labelW;
        $lines = $this->wrap($value, max($maxW, 60), 10);

        $top = $this->y;
        $this->text(self::PAD, $label, 10, $this->c['muted']);
        foreach ($lines as $i => $line) {
            $this->textRight(self::PRICE_RIGHT, $line, 10, $this->c['dark']);
            if ($i < count($lines) - 1) {
                $this->y += $this->lineHeight(10);
            }
        }
        $this->y = $top + (count($lines) * $this->lineHeight(10));
    }

    /** A totals line with a dashed rule above it. */
    private function totalRow(string $label, string $value, int $valueColor, bool $bold = false, float $size = 10): void
    {
        $this->hr($this->c['dash'], 1, true);
        $this->y += 6;
        $top = $this->y;
        $this->text(self::PAD, $label, $size, $this->c['dark'], $bold);
        $this->textRight(self::PRICE_RIGHT, $value, $size, $valueColor, $bold);
        $this->y = $top + $this->lineHeight($size) + 4;
    }

    /** Draw text with its left edge at $x, top at the current cursor. */
    private function text(float $x, string $text, float $size, int $color, bool $bold = false): void
    {
        if ($text === '') {
            return;
        }
        $font = $bold ? $this->fontBold : $this->fontRegular;
        $box = imagettfbbox($size, 0, $font, $text);
        $ascent = -$box[7];
        imagettftext($this->img, $size, 0, (int) round($x), (int) round($this->y + $ascent), $color, $font, $text);
    }

    private function textRight(float $rightX, string $text, float $size, int $color, bool $bold = false): void
    {
        $this->text($rightX - $this->tw($text, $size, $bold), $text, $size, $color, $bold);
    }

    private function centered(string $text, float $size, int $color, bool $bold = false): void
    {
        $x = (self::WIDTH - $this->tw($text, $size, $bold)) / 2;
        $top = $this->y;
        $this->text($x, $text, $size, $color, $bold);
        $this->y = $top + $this->lineHeight($size);
    }

    /** Width of a rendered string in pixels. */
    private function tw(string $text, float $size, bool $bold = false): float
    {
        $font = $bold ? $this->fontBold : $this->fontRegular;
        $box = imagettfbbox($size, 0, $font, $text);

        return abs($box[2] - $box[0]);
    }

    private function lineHeight(float $size): float
    {
        return $size * 1.7;
    }

    /** Word-wrap $text to fit $maxWidth pixels at the given font size. */
    private function wrap(string $text, float $maxWidth, float $size, bool $bold = false): array
    {
        $words = preg_split('/\s+/', trim($text)) ?: [];
        $lines = [];
        $cur = '';
        foreach ($words as $w) {
            $try = $cur === '' ? $w : $cur.' '.$w;
            if ($cur === '' || $this->tw($try, $size, $bold) <= $maxWidth) {
                $cur = $try;
            } else {
                $lines[] = $cur;
                $cur = $w;
            }
        }
        if ($cur !== '') {
            $lines[] = $cur;
        }

        return $lines ?: [''];
    }

    /** Horizontal rule across the content width at the current cursor. */
    private function hr(int $color, int $thickness = 1, bool $dashed = false): void
    {
        $y = (int) round($this->y);
        $x1 = self::PAD;
        $x2 = self::WIDTH - self::PAD;

        if ($dashed) {
            for ($x = $x1; $x <= $x2; $x += 8) {
                imagefilledrectangle($this->img, $x, $y, min($x + 4, $x2), $y + $thickness - 1, $color);
            }
        } else {
            imagefilledrectangle($this->img, $x1, $y, $x2, $y + $thickness - 1, $color);
        }
    }

    private function money($amount): string
    {
        return self::CURRENCY.' '.number_format((float) $amount, 2);
    }

    /**
     * Load the header logo from the path configured in Settings. Supports a
     * local file (the normal case — uploads land in public/storage/logos) or a
     * remote URL. Returns null (caller falls back to a text title) if it cannot
     * be read or decoded.
     */
    private function loadLogo(): ?GdImage
    {
        $source = $this->logoSource;
        if (! $source) {
            return null;
        }

        $data = null;

        if (is_file($source)) {
            $data = (string) file_get_contents($source);
        } elseif (filter_var($source, FILTER_VALIDATE_URL)) {
            try {
                $res = Http::timeout(8)->get($source);
                $data = $res->successful() ? $res->body() : null;
            } catch (\Throwable $e) {
                $data = @file_get_contents($source) ?: null;
            }
        }

        if (empty($data)) {
            return null;
        }

        $img = @imagecreatefromstring($data);

        return $img instanceof GdImage ? $img : null;
    }
}
