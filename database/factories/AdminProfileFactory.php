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
            'employee_id' => $this->faker->unique()->numerify('EMP######'),
            'department' => $this->faker->jobTitle(),
            'position' => $this->faker->word(),
            'employment_status' => $this->faker->randomElement(['Tetap', 'Kontrak', 'Magang']),
            'join_date' => $this->faker->date(),
            'phone_number' => $this->faker->optional()->phoneNumber(),
            'address' => $this->faker->optional()->address(),
            'supervisor_name' => $this->faker->optional()->name(),
            'work_location' => $this->faker->city(),
        ];
    }
}