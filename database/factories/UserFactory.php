<?php

namespace Database\Factories;

use App\Models\MahasiswaProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('a'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Configure the model for a mahasiswa user.
     */
    public function mahasiswa(): static
    {
        return $this->afterCreating(function (User $user) {
            // Ensure 'mahasiswa' role exists
            $role = Role::firstOrCreate(['name' => 'mahasiswa', 'guard_name' => 'web']);
            $user->assignRole($role);
            MahasiswaProfile::factory()->for($user)->create();
        });
    }

    /**
     * Configure the model for an admin user.
     */
    public function admin(): static
    {
        return $this->afterCreating(function (User $user) {
            // Ensure 'admin' role exists
            $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
            $user->assignRole($role);
            // Assuming AdminProfile exists and has a factory
            // \App\Models\AdminProfile::factory()->for($user)->create();
        });
    }

    /**
     * Configure the model for a dosen user.
     */
    public function dosen(): static
    {
        return $this->afterCreating(function (User $user) {
            // Ensure 'dosen' role exists
            $role = Role::firstOrCreate(['name' => 'dosen', 'guard_name' => 'web']);
            $user->assignRole($role);
            // Assuming DosenProfile exists and has a factory
            // \App\Models\DosenProfile::factory()->for($user)->create();
        });
    }
}
