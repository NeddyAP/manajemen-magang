<?php

namespace Database\Seeders;

use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use Illuminate\Database\Seeder;

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
        })
            ->whereHas('mahasiswaProfile') // Ensure student has a MahasiswaProfile
            ->get();

        if ($guidanceClasses->isEmpty() || $students->isEmpty()) {
            $this->command->warn('Tidak ada kelas bimbingan atau mahasiswa ditemukan. Melewati GuidanceClassAttendanceSeeder.');

            return;
        }

        foreach ($guidanceClasses as $guidanceClass) {
            // Assign 5 to 15 students to each class
            $selectedStudentsCount = min($students->count(), fake()->numberBetween(5, 15));
            if ($selectedStudentsCount === 0) {
                continue;
            }

            $selectedStudents = $students->random($selectedStudentsCount);
            // If random returns a single item, convert it to a collection
            if ($selectedStudents instanceof User) {
                $selectedStudents = collect([$selectedStudents]);
            }

            foreach ($selectedStudents as $student) {
                GuidanceClassAttendance::factory()
                    ->for($guidanceClass)
                    ->for($student)
                    ->create();
            }
        }
    }
}
