@php
    // Business identity for the receipt comes from the Settings module
    // (Setting::first()). $settings may be null before the first profile is saved.
    $bizName    = $settings->company ?? $settings->name ?? config('app.name');
    $bizAddress = $settings->address ?? null;
    $bizPhone   = $settings->phone ?? null;
    $bizEmail   = $settings->email ?? null;
    $bizFooter  = $settings->message ?? ('Thank you for visiting '.$bizName);
    $bizLogo    = $settings && $settings->logo && is_file(public_path($settings->logo))
                    ? asset($settings->logo)
                    : null;
    $associate  = auth()->user()->name ?? ($settings->name ?? '—');
    $currency   = $settings->currency ?? 'PKR';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $bizName }}</title>
    <!-- Bootstrap 5 CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: #f8f9fa;
            font-family: Arial, sans-serif;
        }
        .invoice-card {
            max-width: 400px;
            margin: 1px auto;
            border-radius: 5px;
            box-shadow: 0 4px 12px 0 rgba(0,0,0,0.1);
        }
        .invoice-header {

            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .invoice-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .invoice-address {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 5px;
        }
        .invoice-table th, .invoice-table td {
            padding: 8px 5px;
            vertical-align: middle;
        }
        .invoice-table thead th {
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
        }
        .invoice-table tbody tr:last-child td {
            border-bottom: none;
        }
        .calculation-row {
            border-top: 1px dashed #dee2e6;
            padding-top: 8px;
        }
        .positive-amount {
            color: #28a745;
        }
        .negative-amount {
            color: #dc3545;
        }
        .invoice-footer {
            color: #6c757d;
            font-size: 0.9rem;
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px dashed #dee2e6;
        }
        .print-bar {
            max-width: 400px;
            margin: 12px auto 0;
            text-align: center;
        }
        /* Thermal-roll friendly: no page margins, full-width card, no shadow. */
        @media print {
            @page { size: 80mm auto; margin: 4mm; }
            body { background: #fff; }
            .invoice-card { box-shadow: none; margin: 0; max-width: 100%; }
            .print-bar { display: none; }
        }
    </style>
</head>
<body>
<div class="card invoice-card">
    <div class="card-body p-4">
        <div class="invoice-header text-center">
            @if($bizLogo)
                <img src="{{ $bizLogo }}" alt="{{ $bizName }}" width="100">
            @else
                <div class="invoice-title">{{ $bizName }}</div>
            @endif

            <div class="invoice-address">
                @if($bizAddress){{ $bizAddress }}<br>@endif
                @if($bizPhone){{ $bizPhone }}@endif
                @if($bizEmail)<br>{{ $bizEmail }}@endif
            </div>
        </div>

        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Invoice No:</span>
                <span class="fw-bold">INV-{{ $order->id }}-{{ strtotime($order->order_datetime) }}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Order-Type:</span>
                <span>{{ $order->type ?? 'N/A' }}</span>
            </div>
        </div>

        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Date:</span>
                <span>{{ $order->order_datetime->format('d/m/Y H:i') }}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Sale's Associate:</span>
                <span>{{ $associate }}</span>
            </div>
        </div>

        <div class="mb-3">
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Customer:</span>
                <span>{{ $order->customer->name ?? 'Guest' }}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Phone:</span>
                <span>{{ $order->customer->contact ?? 'N/A' }}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="fw-semibold">Address:</span>
                <span>{{ $order->customer->address ?? 'N/A' }}</span>
            </div>
        </div>

        <table class="table invoice-table mb-3">
            <thead>
            <tr>
                <th>Items</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Price</th>
            </tr>
            </thead>
            <tbody>
            @foreach($order->orderItems as $item)
            <tr>
                <td>{{ $item->item->name ?? 'Item' }}</td>
                <td class="text-end">{{ $item->quantity }}</td>
                <td class="text-end">{{ $currency }} {{ number_format($item->sub_total, 2) }}</td>
            </tr>
            @endforeach
            </tbody>
        </table>

        <div class="mb-2 text-end">
            <span class="fw-semibold">Total Items:</span>
            <span>{{ $order->qty }}</span>
        </div>

        <div class="mb-1 calculation-row d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>{{ $currency }} {{ number_format($order->subtotal, 2) }}</span>
        </div>
        <div class="mb-1 calculation-row d-flex justify-content-between">
            <span>Service Charges ({{ $order->service_charges_percentage }}%):</span>
            <span class="positive-amount">+{{ $currency }} {{ number_format($order->service_charges, 2) }}</span>
        </div>
        <div class="mb-1 calculation-row d-flex justify-content-between">
            <span>Discount:</span>
            <span class="negative-amount">-{{ $currency }} {{ number_format($order->discount_amount, 2) }}</span>
        </div>
        <div class="mb-3 calculation-row d-flex justify-content-between">
            <span class="fw-bold">Grand Total:</span>
            <span class="fw-bold">{{ $currency }} {{ number_format($order->grand_total, 2) }}</span>
        </div>

        <div class="invoice-footer">
            {{ $bizFooter }}
        </div>
    </div>
</div>

<div class="print-bar">
    <button type="button" class="btn btn-primary btn-sm" onclick="window.print()">Print receipt</button>
</div>

<script>
    // Auto-open the print dialog once the layout (and the logo image) has loaded.
    // This page is loaded in a hidden iframe by the POS after an order is placed,
    // and can also be opened directly to reprint.
    (function () {
        var printed = false;
        function go() {
            if (printed) return;
            printed = true;
            window.focus();
            window.print();
        }
        if (document.readyState === 'complete') {
            setTimeout(go, 300);
        } else {
            window.addEventListener('load', function () { setTimeout(go, 300); });
        }
        // Fallback in case the logo image never fires load.
        setTimeout(go, 2500);
    })();
</script>
</body>
</html>
