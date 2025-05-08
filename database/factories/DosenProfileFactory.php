<?php

namespace Database\Factories;

use App\Models\DosenProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

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
            'employee_number' => $this->faker->unique()->numerify('##########'), // Nomor Induk Pegawai
            'expertise' => $this->faker->jobTitle(), // Bidang keahlian
            'last_education' => $this->faker->randomElement(['S1', 'S2', 'S3']), // Pendidikan terakhir
            'academic_position' => $this->faker->randomElement(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor']), // Jabatan akademik
            'employment_status' => $this->faker->randomElement(['PNS', 'Non-PNS']), // Status kepegawaian
            'teaching_start_year' => $this->faker->year(), // Tahun mulai mengajar
        ];
    }
}