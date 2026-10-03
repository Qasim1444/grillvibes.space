<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Traits\CrudOperations;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    use CrudOperations;

    protected $model = Customer::class;

    protected function validationRules($id = null): array
    {

        return [
            'name' => 'required|string|max:255',
            'contact' => 'required',

            'address' => 'required|string',
            'email' => [
                'nullable',
                'email:rfc,dns',
                'string',
                'max:255',
                Rule::unique('customers', 'email')->ignore($id),
            ],
            'date_of_birth' => 'nullable|date',

        ];
    }
}
