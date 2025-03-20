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
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->unique()->comment('ID Pegawai');
            $table->string('department')->comment('Departemen');
            $table->string('position')->comment('Jabatan');
            $table->enum('employment_status', ['Tetap', 'Kontrak', 'Magang'])->default('Tetap')->comment('Status Kepegawaian');
            $table->date('join_date')->comment('Tanggal Bergabung');
            $table->string('phone_number')->nullable()->comment('Nomor Telepon');
            $table->text('address')->nullable()->comment('Alamat');
            $table->string('supervisor_name')->nullable()->comment('Nama Atasan');
            $table->string('work_location')->comment('Lokasi Kerja');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};
