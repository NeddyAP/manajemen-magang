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
        $tables = [
            'users',
            'admin_profiles',
            'dosen_profiles',
            'faqs',
            'global_variables',
            'guidance_classes',
            'internships',
            'logbooks',
            'mahasiswa_profiles',
            'reports',
            'tutorials',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users',
            'admin_profiles',
            'dosen_profiles',
            'faqs',
            'global_variables',
            'guidance_classes',
            'internships',
            'logbooks',
            'mahasiswa_profiles',
            'reports',
            'tutorials',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
}; 