<?php

namespace App\Http\Controllers;

class SettingController extends Controller
{
    protected function validationRules($id = null): array
    {
        return [

            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'required|string|max:255',
            'ordertype' => 'required|string|max:50',
            'date' => 'required|date',
            'invoiceno' => 'required|string|max:100',
            'salesassociate' => 'required|string|max:100',
            'footermessage' => 'nullable|string',
        ];
    }
}
