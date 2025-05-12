<?php

namespace Database\Factories;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Logbook>
 */
class LogbookFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Logbook::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Create an internship and get its user_id
        // Ensure the user created for the internship is a mahasiswa
        $internship = Internship::factory()->for(User::factory()->mahasiswa())->create();

        return [
            'internship_id' => $internship->id,
            'user_id' => $internship->user_id, // Set user_id from the internship
            'activities' => fake()->paragraph(3),
            'supervisor_notes' => fake()->optional(0.6)->sentences(2, true),
            'date' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
