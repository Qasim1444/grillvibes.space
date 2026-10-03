<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Traits\Placetrait;

class PlaceController extends Controller
{
    use Placetrait;

    protected $model = Place::class;

    protected function validationRules($id = null): array
    {

        return [
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',

        ];
    }
}
