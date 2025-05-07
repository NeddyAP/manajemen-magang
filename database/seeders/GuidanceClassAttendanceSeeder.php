<?php

namespace Database\Seeders;

use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class GuidanceClassAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guidanceClasses = GuidanceClass::all();
        $students = User::whereHas('roles', function ($query) {
            $query->where('name', 'mahasiswa');
        })->get();

        if ($guidanceClasses->isEmpty() || $students->isEmpty()) {
            $this->command->warn('No guidance classes or students found. Skipping GuidanceClassAttendanceSeeder.');

            return;
        }

        foreach ($guidanceClasses as $class) {
            // Assign 5 to 15 students to each class
            $selectedStudents = $students->random(min($students->count(), fake()->numberBetween(5, 15)));

            foreach ($selectedStudents as $student) {
                $attendedAt = null;
                if (fake()->boolean(80)) { // 80% chance of attending
                    $attendedAt = Carbon::parse($class->start_date)->addMinutes(fake()->numberBetween(0, 30));
                }

                GuidanceClassAttendance::create([
                    'guidance_class_id' => $class->id,
                    'user_id' => $student->id,
                    'attended_at' => $attendedAt,
                    'attendance_method' => $attendedAt ? fake()->randomElement(['qr_code', 'manual']) : null,
                    'notes' => $attendedAt && fake()->boolean(20) ? fake()->sentence() : null,
                ]);
            }
        }
    }
}
