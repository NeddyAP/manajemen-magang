<?php

namespace Database\Factories;

use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GuidanceClassAttendance>
 */
class GuidanceClassAttendanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = GuidanceClassAttendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'guidance_class_id' => GuidanceClass::factory(),
            'user_id' => User::factory()->mahasiswa(), // Default to a mahasiswa user
            'attended_at' => $this->faker->optional(0.7)->dateTimeThisMonth(),
            'attendance_method' => $this->faker->randomElement(['qr_scan', 'manual', null]),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the attendance is marked.
     */
    public function attended(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'attended_at' => Carbon::instance($this->faker->dateTimeThisMonth()),
                'attendance_method' => $this->faker->randomElement(['qr_scan', 'manual']),
            ];
        });
    }

    /**
     * Indicate that the attendance is not marked.
     */
    public function notAttended(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'attended_at' => null,
                'attendance_method' => null,
            ];
        });
    }

    /**
     * Indicate that the attendance was marked manually.
     */
    public function markedManually(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'attended_at' => Carbon::instance($this->faker->dateTimeThisMonth()),
                'attendance_method' => 'manual',
            ];
        });
    }
}
