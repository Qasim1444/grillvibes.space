<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_calls', function (Blueprint $table) {
            $table->id();
            // WhatsApp call id (used to de-duplicate on repeated polls).
            $table->string('wa_call_id')->nullable()->unique();
            $table->string('number')->index();          // digits-only contact
            $table->foreignId('customer_id')->nullable()->index();
            $table->string('direction', 12)->default('incoming'); // incoming|outgoing
            $table->string('status', 24)->nullable();    // ringing|offer|rejected|missed...
            $table->boolean('is_video')->default(false);
            $table->string('caller_jid')->nullable();    // raw WhatsApp JID
            $table->string('name')->nullable();          // caller display name
            $table->timestamp('call_time')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_calls');
    }
};
