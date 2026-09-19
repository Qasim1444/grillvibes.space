<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('permissions')->where('key', 'like', 'branches.%')->delete();

        User::query()
            ->pluck('id')
            ->each(fn ($id) => Cache::forget(User::permissionCacheKey($id)));
    }

    public function down(): void
    {
        // Branch management permissions were removed from the product.
    }
};
