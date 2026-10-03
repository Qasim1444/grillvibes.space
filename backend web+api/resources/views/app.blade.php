<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {{-- Read by pages that POST via raw fetch() instead of Inertia (floor plan, KDS board). --}}
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title inertia>GrillVibes Admin</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
