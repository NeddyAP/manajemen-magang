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

        // Create Mahasiswa Users (advisor assignment is handled in UserFactory@mahasiswa)
        User::factory()->count(20)->mahasiswa()->create([
            // You can override default factory values here if needed for the 20 users,
            // but for unique emails and names, the factory's definition() is usually sufficient.
            // If specific naming like 'Mahasiswa X' is needed, a loop might be better,
            // but the request was to simplify.
        ]);

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
