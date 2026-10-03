<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Whatsapp extends Model
{
    use HasFactory;

    // Ensure api_key is fillable
    protected $fillable = [
        'device',
        'api_key',
    ];
}
