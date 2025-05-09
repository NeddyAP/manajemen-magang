<?php

use App\Enums\TutorialAccessLevelEnum;
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
        Schema::create('tutorials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('file_name');
            $table->string('file_path');
            $table->enum('access_level', array_column(TutorialAccessLevelEnum::cases(), 'value'))->default(TutorialAccessLevelEnum::ALL->value);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            // index
            $table->index(['title', 'file_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('tutorials');
    }
};
