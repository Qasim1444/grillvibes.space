<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    const UPDATED_AT = null;

    // If you only use 'created_at'
    public $timestamps = false;

    protected $fillable = [
        'email',
        'otp',
        'created_at',
    ];

    protected $table = 'password_resets';
}
