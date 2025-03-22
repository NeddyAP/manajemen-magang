<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class TutorialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Tutorial::factory(15)->create();
    }
}
