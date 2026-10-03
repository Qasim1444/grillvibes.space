<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            // WhatsApp message id (used to de-duplicate on repeated syncs).
            $table->string('wa_message_id')->nullable()->unique();
            $table->string('number')->index();          // digits-only contact
            $table->foreignId('customer_id')->nullable()->index();
            $table->string('direction', 12)->default('incoming'); // incoming|outgoing
            $table->string('message_type', 24)->default('text');  // text|image|video|...
            $table->text('text')->nullable();
            $table->string('media_url')->nullable();     // local/proxied media path
            $table->string('media_mime')->nullable();
            $table->string('status', 24)->nullable();    // received|sent|read...
            $table->string('name')->nullable();          // sender display name
            $table->timestamp('sent_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
