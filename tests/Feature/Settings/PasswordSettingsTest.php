<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $dosenUser;

    private User $mahasiswaUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->adminUser = User::factory()->create(['password' => Hash::make('oldpassword')]);
        $this->adminUser->assignRole('admin');

        $this->dosenUser = User::factory()->create(['password' => Hash::make('oldpassword')]);
        $this->dosenUser->assignRole('dosen');

        $this->mahasiswaUser = User::factory()->create(['password' => Hash::make('oldpassword')]);
        $this->mahasiswaUser->assignRole('mahasiswa');
    }

    // Edit Page Tests
    public function test_admin_can_view_their_password_edit_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('password.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/settings/password'));
    }

    public function test_dosen_can_view_their_password_edit_page(): void
    {
        $response = $this->actingAs($this->dosenUser)->get(route('password.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('front/settings/password'));
    }

    public function test_mahasiswa_can_view_their_password_edit_page(): void
    {
        $response = $this->actingAs($this->mahasiswaUser)->get(route('password.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('front/settings/password'));
    }

    // Update Password Tests
    public function test_user_can_update_their_password_with_correct_current_password(): void
    {
        $user = $this->mahasiswaUser; // Test with one user type, logic is same

        $updateData = [
            'current_password' => 'oldpassword',
            'password' => 'newStrongPassword1!',
            'password_confirmation' => 'newStrongPassword1!',
        ];

        $response = $this->actingAs($user)->put(route('password.update'), $updateData);

        $response->assertRedirect(); // Redirects back
        $user->refresh();
        $this->assertTrue(Hash::check('newStrongPassword1!', $user->password));
    }

    public function test_user_cannot_update_password_with_incorrect_current_password(): void
    {
        $user = $this->dosenUser;

        $updateData = [
            'current_password' => 'wrongoldpassword',
            'password' => 'newStrongPassword1!',
            'password_confirmation' => 'newStrongPassword1!',
        ];

        $response = $this->actingAs($user)->put(route('password.update'), $updateData);

        $response->assertSessionHasErrors('current_password');
        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword', $user->password)); // Password should not have changed
    }

    public function test_user_cannot_update_password_if_new_password_is_weak(): void
    {
        $user = $this->adminUser;

        $updateData = [
            'current_password' => 'oldpassword',
            'password' => 'weak', // Fails Password::defaults()
            'password_confirmation' => 'weak',
        ];

        $response = $this->actingAs($user)->put(route('password.update'), $updateData);

        $response->assertSessionHasErrors('password');
        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword', $user->password));
    }

    public function test_user_cannot_update_password_if_confirmation_does_not_match(): void
    {
        $user = $this->mahasiswaUser;

        $updateData = [
            'current_password' => 'oldpassword',
            'password' => 'newStrongPassword1!',
            'password_confirmation' => 'mismatchedPassword1!',
        ];

        $response = $this->actingAs($user)->put(route('password.update'), $updateData);

        $response->assertSessionHasErrors('password'); // Error key is 'password' for confirmation
        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword', $user->password));
    }
}
