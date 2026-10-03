<?php

namespace App\Http\Controllers;

use App\Models\Whatsapp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class whatsappapi extends Controller
{
    public function index()
    {
        $number = Whatsapp::get();

        return response()->json($number);
    }

    public function generateQr(Request $request)
    {
        $device = $request->get('device');
        $api_key = $request->get('api_key');
        $force = $request->get('force');

        // Save device and api_key to database
        Whatsapp::firstOrCreate(
            ['device' => $device],
            ['api_key' => $api_key]
        );

        $url = 'http://whatsappapi.codewiresolutions.com/generate-qr';
        $params = [
            'device' => $device,
            'api_key' => $api_key,
            'force' => $force,
        ];

        $response = Http::asForm()->post($url, $params);
        $data = $response->json();

        if (isset($data['qrcode']) && $data['qrcode']) {
            $base64String = $data['qrcode'];

            // Remove base64 prefix
            if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
                $base64String = substr($base64String, strpos($base64String, ',') + 1);
                $extension = strtolower($type[1]);
            } else {
                $extension = 'png';
            }

            $base64String = str_replace(' ', '+', $base64String);
            $imageData = base64_decode($base64String);

            if ($imageData !== false) {
                $fileName = 'qrcode_'.Str::random(10).'.'.$extension;
                $filePath = 'qrcodes/'.$fileName;

                // Save file to storage/app/public/qrcodes
                Storage::disk('public')->put($filePath, $imageData);

                // Get full public URL using APP_URL
                $data['qrcode_url'] = asset('storage/'.$filePath);
            }
        }

        return response()->json($data, $response->status());
    }

    public function logoutDevice(Request $request)
    {
        $sender = $request->get('sender');
        $api_key = $request->get('api_key');

        // Delete the device from the database
        Whatsapp::where('device', $sender)->delete();

        $url = 'http://whatsappapi.codewiresolutions.com/logout-device';
        $params = [
            'sender' => $sender,
            'api_key' => $api_key,
        ];

        $response = Http::asForm()->post($url, $params);

        return response()->json($response->json(), $response->status());
    }
}
