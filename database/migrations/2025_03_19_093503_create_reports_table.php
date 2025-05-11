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
            // Add new fields for Dosen's revised file
            $table->string('revised_file_path')->nullable();
            $table->timestamp('revision_uploaded_at')->nullable();
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
            // Drop the new columns if they exist
            $table->dropColumn(array_filter(['revised_file_path', 'revision_uploaded_at'], function ($column) use ($table) {
                return Schema::hasColumn($table->getTable(), $column);
            }));
        });
        Schema::dropIfExists('reports');
    }
};
