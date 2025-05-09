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
        Schema::create('global_variables', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('slug')->unique();
            $table->string('value')->nullable();
            $table->text('description')->nullable();
            $table->string('type')->default('text');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('global_variables', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('global_variables');
    }
};
