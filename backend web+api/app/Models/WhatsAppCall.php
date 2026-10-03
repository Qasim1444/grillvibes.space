<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppCall extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_calls';

    protected $fillable = [
        'wa_call_id',
        'number',
        'customer_id',
        'direction',
        'status',
        'is_video',
        'caller_jid',
        'name',
        'call_time',
    ];

    protected $casts = [
        'is_video' => 'boolean',
        'call_time' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}
