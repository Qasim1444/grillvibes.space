<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia (server-rendered) Settings page — replaces the old /api settings
 * endpoints. Logo uploads arrive as multipart form data (Inertia switches to
 * FormData automatically when a File is present); edits spoof PUT via _method.
 */
class SettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings', [
            'settings' => Setting::orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
          // Check if settings already exist
        $setting = Setting::first();

        // Validation
        $data = $request->validate($this->rules($setting));

        /*
        |--------------------------------------------------------------------------
        | Logo
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->storeLogo($request);
        } elseif ($setting) {
            // Keep existing logo when no new logo is uploaded
            unset($data['logo']);
        }

        /*
        |--------------------------------------------------------------------------
        | Create or Update
        |--------------------------------------------------------------------------
        */

        if ($setting) {
            // Existing record → UPDATE
            $setting->update($data);

            return back()->with(
                'success',
                'Settings updated successfully.'
            );
        }

        // No record exists → CREATE first record
        Setting::create($data);

        return back()->with(
            'success',
            'Settings saved successfully.'
        );
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $setting = Setting::findOrFail($id);
        $data = $request->validate($this->rules($id));

        if ($request->hasFile('logo')) {
            $data['logo'] = $this->storeLogo($request);
        } else {
            unset($data['logo']);
        }

        $setting->update($data);

        return back()->with('success', 'Settings updated.');
    }

    public function destroy($id): RedirectResponse
    {
        Setting::findOrFail($id)->delete();

        return back()->with('success', 'Settings deleted.');
    }

    private function storeLogo(Request $request): string
    {
        $path = $request->file('logo')->store('logos', 'public');

        return 'storage/'.$path;
    }

    /** Logo is required on create, optional on edit. */
    private function rules($id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'logo' => ($id ? 'nullable' : 'required').'|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'company' => 'required|string|max:255',
            'address' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string|max:50',
            'message' => 'nullable|string',
        ];
    }
}
