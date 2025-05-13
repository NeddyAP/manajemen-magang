<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            InternshipDataSeeder::class,
            FaqSeeder::class,
            TutorialSeeder::class,
            GlobalVariableSeeder::class,
            ReportSeeder::class,
            GuidanceClassSeeder::class,
            GuidanceClassAttendanceSeeder::class,
        ]);
    }
}
