<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Faq::factory()
            ->count(15)
            ->create([
                'is_active' => true,
                'order' => 0,
            ]);
    }
}
