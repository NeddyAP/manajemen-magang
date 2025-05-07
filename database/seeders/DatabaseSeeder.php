<?php

namespace Database\Seeders;

use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // Create admin users
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('a'),
        ])->assignRole('superadmin');

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('a'),
        ])->assignRole('admin');

        // Create 5 dosen with their profiles
        $dosen = collect();
        for ($i = 1; $i <= 5; $i++) {
            $dosenUser = User::factory()->create([
                'email' => "dosen{$i}@example.com",
                'password' => bcrypt('a'),
            ]);
            $dosenUser->assignRole('dosen');

            DosenProfile::create([
                'user_id' => $dosenUser->id,
                'employee_number' => fake()->unique()->numerify('DSN###'),
                'expertise' => fake()->randomElement(['Informatika', 'Sistem Informasi', 'Jaringan Komputer', 'Kecerdasan Buatan', 'Rekayasa Perangkat Lunak']),
                'last_education' => fake()->randomElement(['S2', 'S3']),
                'academic_position' => fake()->randomElement(['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar']),
                'employment_status' => fake()->randomElement(['PNS', 'Non-PNS']),
                'teaching_start_year' => fake()->numberBetween(2010, 2020),
            ]);

            $dosen->push($dosenUser);
        }

        // Create 20 mahasiswa with their profiles, internships, and logbooks
        for ($i = 1; $i <= 20; $i++) {
            $mahasiswaUser = User::factory()->create([
                'email' => "mahasiswa{$i}@example.com",
                'password' => bcrypt('a'),
            ]);
            $mahasiswaUser->assignRole('mahasiswa');

            // Create mahasiswa profile with random dosen as advisor
            MahasiswaProfile::create([
                'user_id' => $mahasiswaUser->id,
                'advisor_id' => $dosen->random()->id,
                'student_number' => fake()->unique()->numerify('I.22#####'),
                'study_program' => fake()->randomElement(['Teknik Informatika', 'Sistem Informasi']),
                'class_year' => fake()->numberBetween(2020, 2023),
                'academic_status' => 'Aktif',
                'semester' => fake()->numberBetween(1, 8),
                'gpa' => fake()->randomFloat(2, 2.5, 4.0),
            ]);

            // Create 1-2 internships for each mahasiswa
            $internshipCount = fake()->numberBetween(1, 2);
            for ($j = 1; $j <= $internshipCount; $j++) {
                $internship = Internship::factory()->create([
                    'user_id' => $mahasiswaUser->id,
                ]);

                // Create 5-10 logbook entries for each internship
                $logbookCount = fake()->numberBetween(5, 10);
                for ($k = 1; $k <= $logbookCount; $k++) {
                    Logbook::factory()->create([
                        'internship_id' => $internship->id,
                        'date' => fake()->dateTimeBetween($internship->start_date, $internship->end_date),
                    ]);
                }
            }
        }

        // Call other seeders
        $this->call(FaqSeeder::class);
        $this->call(TutorialSeeder::class);
        $this->call(GlobalVariableSeeder::class);
        $this->call(ReportSeeder::class);

        // Test data
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
        ])->assignRole('mahasiswa');
    }
}
