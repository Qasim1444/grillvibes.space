<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_post_id')->constrained('blog_posts')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('blog_comments')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name');
            $table->string('author_email')->nullable();
            $table->text('body');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
            $table->index(['blog_post_id', 'parent_id', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_comments');
    }
};
