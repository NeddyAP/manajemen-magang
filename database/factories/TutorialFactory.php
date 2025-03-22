<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tutorial>
 */
class TutorialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'content' => fake()->paragraph(),
            'file_name' => fake()->sentence(),
            'file_path' => fake()->filePath(),
            'access_level' => fake()->randomElement(['mahasiswa', 'dosen', 'all']),
            'is_active' => fake()->boolean(),
        ];
    }
}
