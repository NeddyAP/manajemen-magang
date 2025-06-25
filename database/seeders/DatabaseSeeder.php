<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\Tutorial;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Faq::factory()
            ->count(15)
            ->create([
                'is_active' => true,
                'order' => 0,
            ]);
        Tutorial::factory(15)->create();
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            InternshipSeeder::class,
            GlobalVariableSeeder::class,
            ReportSeeder::class,
            GuidanceClassSeeder::class,
            GuidanceClassAttendanceSeeder::class,
        ]);
    }
}
