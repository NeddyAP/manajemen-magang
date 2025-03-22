<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GlobalVariableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\GlobalVariable::factory()->count(10)->create([
            'is_active' => true,
        ]);

        \App\Models\GlobalVariable::factory()->count(5)->create([
            'is_active' => false,
        ]);
    }
}
