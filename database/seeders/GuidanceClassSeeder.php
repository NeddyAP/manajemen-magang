<?php

namespace Database\Seeders;

use App\Models\GuidanceClass;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class GuidanceClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lecturers = User::whereHas('roles', function ($query) {
            $query->where('name', 'dosen');
        })->get();

        if ($lecturers->isEmpty()) {
            $this->command->warn('No lecturers found. Skipping GuidanceClassSeeder.');

            return;
        }

        for ($i = 0; $i < 10; $i++) {
            $startDate = Carbon::now()->addDays(fake()->numberBetween(1, 30))->addHours(fake()->numberBetween(1, 5));
            GuidanceClass::create([
                'title' => 'Bimbingan Kelas '.fake()->words(2, true),
                'lecturer_id' => $lecturers->random()->id,
                'start_date' => $startDate,
                'end_date' => fake()->boolean(70) ? $startDate->copy()->addHours(fake()->numberBetween(1, 2)) : null,
                'room' => fake()->boolean(80) ? 'Ruang '.fake()->buildingNumber() : null,
                'description' => fake()->boolean(60) ? fake()->paragraph() : null,
                'qr_code' => null, // QR code generation can be complex for a seeder
            ]);
        }
    }
}
