<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | These settings allow the browser-based POS and rider apps to call the
    | API while still keeping the accepted origins explicit.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', 'https://grillvibes.space,https://www.grillvibes.space'))
    )),

    'allowed_origins_patterns' => [
        '#^https?://([a-z0-9-]+\.)?grillvibes\.space(:[0-9]+)?$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
