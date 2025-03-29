<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance_class_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guidance_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('attended_at')->nullable();
            $table->string('attendance_method')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Add indexes for better performance
            $table->unique(['guidance_class_id', 'user_id']); // Ensure no duplicate attendance records
            $table->index('attended_at');
            $table->index(['user_id', 'guidance_class_id']); // For querying student's classes
            $table->index(['guidance_class_id', 'attended_at']); // For attendance reports
        });

        // Create trigger to automatically delete related records when a class is deleted
        DB::unprepared('
            CREATE TRIGGER before_guidance_class_delete
            BEFORE DELETE ON guidance_classes
            FOR EACH ROW
            BEGIN
                DELETE FROM guidance_class_attendance
                WHERE guidance_class_id = OLD.id;
            END
        ');
    }

    public function down(): void
    {
        // Drop the trigger first
        DB::unprepared('DROP TRIGGER IF EXISTS before_guidance_class_delete');

        // Then drop the table
        Schema::dropIfExists('guidance_class_attendance');
    }
};
