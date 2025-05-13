<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GuidanceClass>
 */
class GuidanceClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = Carbon::instance(fake()->dateTimeBetween('+1 day', '+1 month'));

        return [
            'title' => fake()->sentence(3),
            'lecturer_id' => User::factory()->dosen(), // Corrected from dosenRole() to dosen()
            'start_date' => $startDate,
            'end_date' => fake()->optional(0.7)->dateTimeBetween($startDate, $startDate->copy()->addHours(2)),
            'room' => fake()->optional()->bothify('Room ##??'),
            'description' => fake()->optional()->paragraph(),
            'qr_code' => null, // QR code is usually generated later
        ];
    }
}
