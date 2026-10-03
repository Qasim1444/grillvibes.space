<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'foodcategory_id',
        'name',
        'description',
        'code',
        'price',
        'image',
        'status',
    ];

    protected $casts = [

        'price' => 'decimal:2',
    ];

    public function foodCategory()
    {
        return $this->belongsTo(FoodCategory::class, 'foodcategory_id');
    }

    /**
     * The dish's recipe — what one portion consumes from the store room.
     *
     * Empty for a dish that has not been costed yet; such a dish still sells
     * normally, it just deducts no stock and reports no COGS.
     */
    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'recipe_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /** True once the dish has at least one recipe line, so it can be costed. */
    public function hasRecipe(): bool
    {
        return $this->recipeItems()->exists();
    }
}
