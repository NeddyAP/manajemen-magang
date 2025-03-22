<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GlobalVariable>
 */
class GlobalVariableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->word(),
            'slug' => fake()->unique()->slug(),
            'value' => fake()->sentence(10),
            'description' => fake()->sentence(),
            'is_active' => fake()->boolean(),
        ];
    }
}
