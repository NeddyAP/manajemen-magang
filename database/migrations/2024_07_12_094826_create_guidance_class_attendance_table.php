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
        Schema::create('guidance_class_attendance', function (Blueprint $table) {
            $table->foreignId('guidance_class_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('attended_at')->nullable();
            $table->string('attendance_method')->nullable(); // 'qr_code', 'manual', etc.
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->primary(['guidance_class_id', 'user_id']);
            $table->index('attended_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guidance_class_attendance');
    }
};
