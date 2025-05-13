<?php

namespace Database\Seeders;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Database\Seeder;

class InternshipDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswaUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'mahasiswa');
        })->get();

        if ($mahasiswaUsers->isEmpty()) {
            $this->command->info('Tidak ada pengguna Mahasiswa ditemukan untuk membuat data magang.');
            return;
        }

        foreach ($mahasiswaUsers as $mahasiswaUser) {
            $numberOfInternships = rand(1, 2);
            for ($i = 0; $i < $numberOfInternships; $i++) {
                $internship = Internship::factory()->for($mahasiswaUser)->create();

                $numberOfLogbooks = rand(5, 10);
                for ($j = 0; $j < $numberOfLogbooks; $j++) {
                    Logbook::factory()
                        ->for($internship)
                        ->for($mahasiswaUser) // Explicitly set user_id for logbook
                        ->create([
                            'date' => fake()->dateTimeBetween($internship->start_date, $internship->end_date)
                        ]);
                }
            }
        }
    }
}