<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AdminProfile>
 */
class AdminProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AdminProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'user_id' is typically set using ->for(User::factory()->adminRole())
            'employee_id' => fake()->unique()->numerify('EMP######'),
            'department' => fake()->jobTitle(),
            'position' => fake()->word(),
            'employment_status' => fake()->randomElement(['Tetap', 'Kontrak', 'Magang']),
            'join_date' => fake()->date(),
            'phone_number' => fake()->phoneNumber(), // Removed optional()
            'address' => fake()->address(),
            'supervisor_name' => fake()->name(),
            'work_location' => fake()->city(),
        ];
    }
}
