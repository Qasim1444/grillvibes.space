<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_messages';

    protected $fillable = [
        'wa_message_id',
        'number',
        'customer_id',
        'direction',
        'message_type',
        'text',
        'media_url',
        'media_mime',
        'status',
        'name',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
}
