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
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['kkl', 'kkn']);
            $table->string('application_file');
            $table->string('company_name');
            $table->string('company_address');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['waiting', 'accepted', 'rejected'])->default('waiting');
            $table->text('status_message')->nullable();
            $table->char('progress', 2)->default('0');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};
