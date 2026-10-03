<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One line of a dish's recipe: "this dish uses this much of this ingredient".
 *
 * `quantity` is per ONE portion, in the ingredient's own unit. This model is the
 * only structural link between the menu (`food_items`) and inventory
 * (`ingredients`).
 */
class RecipeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'food_item_id', 'ingredient_id', 'quantity', 'note',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    public function foodItem()
    {
        return $this->belongsTo(FoodItem::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
