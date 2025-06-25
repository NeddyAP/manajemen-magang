<?php

namespace Database\Factories;

use App\Models\User; // Added User model
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Internship>
 */
class InternshipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('+1 day', '+1 month'); // Ensure start_date is in the future
        $endDate = fake()->dateTimeBetween($startDate, (clone $startDate)->modify('+6 months')); // Ensure end_date is after start_date

        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['kkl', 'kkn']),
            'application_file' => 'internships/dummy_files/dummy_file.pdf',
            'spp_payment_file' => 'internships/dummy_files/dummy_file.pdf',
            'kkl_kkn_payment_file' => 'internships/dummy_files/dummy_file.pdf',
            'practicum_payment_file' => 'internships/dummy_files/dummy_file.pdf',
            'company_name' => fake()->company(),
            'company_address' => fake()->address(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(['waiting', 'accepted', 'rejected']),
            'status_message' => fake()->optional(0.7)->sentence(),
            'progress' => str_pad(fake()->numberBetween(0, 99), 2, '0', STR_PAD_LEFT),
        ];
    }
}
