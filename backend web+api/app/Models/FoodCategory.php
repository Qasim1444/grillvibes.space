<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'status', 'slug'];

    // Optional: Cast status to boolean
    protected $casts = [
        'status' => 'boolean',
    ];

    public function foodItems()
    {
        return $this->hasMany(FoodItem::class, 'foodcategory_id');
    }
}
