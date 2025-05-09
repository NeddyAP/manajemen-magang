<?php

use App\Enums\ReportStatusEnum;
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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('internship_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('report_file');
            $table->integer('version')->default(1);
            $table->enum('status', array_column(ReportStatusEnum::cases(), 'value'))->default(ReportStatusEnum::PENDING->value);
            $table->text('reviewer_notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('reports');
    }
};
