<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    /** Laravel would pluralise this to "feedbacks" anyway; stated for clarity. */
    protected $table = 'feedbacks';

    protected $fillable = [
        'customer_id',
        'order_id',
        'rating',
        'comment',
        'reply',
        'replied_by',
        'replied_at',
        'is_published',
    ];

    protected $casts = [
        'rating' => 'integer',
        'replied_at' => 'datetime',
        'is_published' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
}
