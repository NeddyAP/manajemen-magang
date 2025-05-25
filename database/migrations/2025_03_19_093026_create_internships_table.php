<?php

use App\Enums\InternshipStatusEnum;
use App\Enums\InternshipTypeEnum;
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
            $table->enum('type', array_column(InternshipTypeEnum::cases(), 'value'));
            $table->string('application_file');
            $table->string('company_name');
            $table->string('company_address');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', array_column(InternshipStatusEnum::cases(), 'value'))->default(InternshipStatusEnum::WAITING->value);
            $table->text('status_message')->nullable();
            $table->char('progress', 2)->default('0');
            $table->softDeletes();
            $table->timestamps();

            // Performance indexes
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['start_date', 'end_date']);
            $table->index('company_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('internships');
    }
};
