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
        Schema::create('dosen_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_number')->unique()->comment('Nomor Induk Pegawai');
            $table->string('expertise')->comment('Bidang keahlian');
            $table->string('last_education')->comment('Pendidikan terakhir');
            $table->string('academic_position')->comment('Jabatan akademik');
            $table->enum('employment_status', ['PNS', 'Non-PNS'])->default('Non-PNS')->comment('Status kepegawaian');
            $table->year('teaching_start_year')->comment('Tahun mulai mengajar');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dosen_profiles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('dosen_profiles');
    }
};
