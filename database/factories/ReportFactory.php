<?php

namespace Database\Factories;

use App\Models\Internship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'internship_id' => Internship::factory(),
            'title' => fake()->sentence,
            'report_file' => 'internships/dummy_files/dummy_file.pdf', // Dummy file path
            // 'report_type', 'content', 'report_date' do not exist in the migration
            'version' => 1,
            'status' => 'pending', // Default status from migration
            'reviewer_notes' => fake()->optional()->sentence,
        ];
    }
}
