<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guidance_classes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('lecturer_id')->constrained('users');
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->string('room')->nullable();
            $table->text('description')->nullable();
            $table->string('qr_code')->nullable();
            $table->timestamps();

            $table->index('lecturer_id');
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guidance_classes');
    }
};
