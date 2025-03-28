<?php

namespace Database\Factories;

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
        $startDate = fake()->dateTimeBetween('-6 months', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+6 months');

        return [
            'type' => fake()->randomElement(['kkl', 'kkn']),
            'application_file' => 'dummy_files/internship_'.fake()->unique()->uuid().'.pdf',
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
