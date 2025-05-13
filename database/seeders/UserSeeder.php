<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('a'),
        ])->assignRole('superadmin');

        // Create Admin
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('a'),
        ])->assignRole('admin');

        // Create Dosen Users
        $dosenUsers = collect();
        for ($i = 1; $i <= 5; $i++) {
            $dosenUsers->push(
                User::factory()->dosen()->create([
                    'name' => 'Dosen '.$i,
                    'email' => "dosen{$i}@example.com",
                    'password' => Hash::make('a'),
                ])
            );
        }

        // Create Mahasiswa Users
        for ($i = 1; $i <= 20; $i++) {
            $mahasiswaUser = User::factory()->mahasiswa()->create([
                'name' => 'Mahasiswa '.$i,
                'email' => "mahasiswa{$i}@example.com",
                'password' => Hash::make('a'),
            ]);

            // Assign a random Dosen as advisor
            if ($mahasiswaUser->mahasiswaProfile && $dosenUsers->isNotEmpty()) {
                $mahasiswaUser->mahasiswaProfile->update([
                    'advisor_id' => $dosenUsers->random()->dosenProfile->id,
                ]);
            }
        }

        // Create Test Mahasiswa User
        User::factory()->mahasiswa()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'), // As per original requirement for test user
        ])->assignRole('mahasiswa');
    }
}
