<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Logbook>
 */
class LogbookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'activities' => fake()->paragraph(3),
            'supervisor_notes' => fake()->optional(0.6)->sentences(2, true),
            'date' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
