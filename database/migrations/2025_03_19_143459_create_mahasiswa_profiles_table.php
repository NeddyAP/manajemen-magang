<?php

use App\Enums\AcademicStatusEnum;
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
        Schema::create('mahasiswa_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('student_number')->unique()->comment('Nomor Induk Mahasiswa');
            $table->string('study_program')->comment('Program studi');
            $table->year('class_year')->comment('Class year/batch');
            $table->enum('academic_status', array_column(AcademicStatusEnum::cases(), 'value'))->default(AcademicStatusEnum::AKTIF->value)->comment('Status akademik');
            $table->integer('semester')->default(1)->comment('Semester saat ini');
            $table->foreignId('advisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('gpa', 3, 2)->nullable()->comment('IPK');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa_profiles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('mahasiswa_profiles');
    }
};
