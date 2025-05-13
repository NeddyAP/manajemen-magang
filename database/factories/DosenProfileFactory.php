<?php

namespace Database\Factories;

use App\Models\DosenProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DosenProfile>
 */
class DosenProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = DosenProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'user_id' will typically be set when using the factory,
            // e.g., DosenProfile::factory()->for(User::factory())->create()
            'employee_number' => fake()->unique()->numerify('##########'), // Nomor Induk Pegawai
            'expertise' => fake()->jobTitle(), // Bidang keahlian
            'last_education' => fake()->randomElement(['S1', 'S2', 'S3']), // Pendidikan terakhir
            'academic_position' => fake()->randomElement(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor']), // Jabatan akademik
            'employment_status' => fake()->randomElement(['PNS', 'Non-PNS']), // Status kepegawaian
            'teaching_start_year' => fake()->year(), // Tahun mulai mengajar
        ];
    }
}
