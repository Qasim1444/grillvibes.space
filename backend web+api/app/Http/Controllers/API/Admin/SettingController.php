<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(Setting::all(), 200);
    }

    public function store(Request $request)
    {

        $data = $request->validate([
            'name' => 'required|string',
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'company' => 'required|string',
            'address' => 'required',
            'email' => 'required|email',
            'phone' => 'required|string',
            'message' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $logoPath = $logo->store('logos', 'public'); // stores in storage/app/public/logos
            $data['logo'] = 'storage/'.$logoPath; // save path for web access
        }

        $setting = Setting::create($data);

        return response()->json($setting, 201);
    }

    public function update(Request $request)
    {
        $setting = Setting::first();
        if (! $setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'logo' => 'sometimes|required',
            'company' => 'sometimes|required|string',
            'address' => 'sometimes|required|string',
            'email' => 'sometimes|required|email',
            'phone' => 'sometimes|required|string',
            'message' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $logo = $request->file('logo');
            $logoPath = $logo->store('logos', 'public');
            $data['logo'] = 'storage/'.$logoPath;
        }

        $setting->update($data);

        return response()->json($setting, 200);
    }

    public function destroy()
    {
        $setting = Setting::first();

        if (! $setting) {
            return response()->json(['message' => 'No setting found to delete'], 404);
        }

        $setting->delete();

        return response()->json(['message' => 'Setting deleted successfully'], 200);
    }
}
