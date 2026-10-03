<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'file_path',
        'type',
        'uploaded_at',
    ];

    protected $dates = [
        'uploaded_at',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
