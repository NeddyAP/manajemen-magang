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

        // Create Mahasiswa Users with specific emails and password
        for ($i = 1; $i <= 20; $i++) {
            User::factory()->mahasiswa()->create([
                'name' => 'Mahasiswa '.$i,
                'email' => "mahasiswa{$i}@example.com",
                'password' => Hash::make('a'),
            ]);
        }

        // Create Test Mahasiswa User (advisor assignment is handled in UserFactory@mahasiswa)
        User::factory()->mahasiswa()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'), // Specific password for the test user
        ]);

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
    }
}
