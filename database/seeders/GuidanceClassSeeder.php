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
        })
        ->whereHas('dosenProfile') // Ensure lecturer has a DosenProfile
        ->get();

        if ($lecturers->isEmpty()) {
            $this->command->warn('Tidak ada dosen ditemukan. Melewati GuidanceClassSeeder.');

            return;
        }

        for ($i = 0; $i < 10; $i++) {
            GuidanceClass::factory()->create([
                'lecturer_id' => $lecturers->random()->dosenProfile->id,
            ]);
        }
    }
}
