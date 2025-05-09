<?php

namespace Database\Factories;

use App\Models\MahasiswaProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MahasiswaProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = MahasiswaProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'student_number' => $this->faker->unique()->numerify('##########'),
            'study_program' => $this->faker->randomElement(['Informatika', 'Sistem Informasi', 'Teknik Komputer', 'Manajemen', 'Akuntansi', 'Hukum']),
            'class_year' => $this->faker->numberBetween(intval(date('Y')) - 6, intval(date('Y')) - 1), // Angkatan, e.g., 1-6 years ago
            'academic_status' => $this->faker->randomElement(['Aktif', 'Cuti', 'Lulus']),
            'semester' => $this->faker->numberBetween(1, 14),
            'advisor_id' => null, // Can be overridden, e.g., User::factory()->dosen()->create()->id
            'gpa' => $this->faker->randomFloat(2, 2.00, 4.00),
        ];
    }
}
