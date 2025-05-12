<?php

namespace Tests\Feature\Settings;

use App\Models\AdminProfile;
use App\Models\DosenProfile;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $dosenUser;

    private User $mahasiswaUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->adminUser = User::factory()->has(AdminProfile::factory())->create();
        $this->adminUser->assignRole('admin');

        $this->dosenUser = User::factory()->has(DosenProfile::factory())->create();
        $this->dosenUser->assignRole('dosen');

        $this->mahasiswaUser = User::factory()->has(MahasiswaProfile::factory())->create();
        $this->mahasiswaUser->assignRole('mahasiswa');
    }

    // Edit Page Tests
    public function test_admin_can_view_their_profile_edit_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settings/profile') // Admin route
            ->has('profile')
            ->where('profile.user_id', $this->adminUser->id)
        );
    }

    public function test_dosen_can_view_their_profile_edit_page(): void
    {
        $response = $this->actingAs($this->dosenUser)->get(route('profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('front/settings/profile') // Front route for Dosen
            ->has('profile')
            ->where('profile.user_id', $this->dosenUser->id)
        );
    }

    public function test_mahasiswa_can_view_their_profile_edit_page(): void
    {
        $response = $this->actingAs($this->mahasiswaUser)->get(route('profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('front/settings/profile') // Front route for Mahasiswa
            ->has('profile')
            ->where('profile.user_id', $this->mahasiswaUser->id)
        );
    }

    // Update Profile Tests
    public function test_admin_can_update_their_profile(): void
    {
        $updateData = [
            'name' => 'Updated Admin Name',
            'email' => 'updated.admin@example.com',
            // AdminProfile specific fields
            'department' => 'Updated IT Department',
            'position' => 'Senior Admin',
            'employee_id' => $this->adminUser->adminProfile->employee_id, // Keep unique field same or provide new valid one
            'employment_status' => 'Tetap',
            'join_date' => $this->adminUser->adminProfile->join_date,
            'phone_number' => $this->adminUser->adminProfile->phone_number,
            'address' => $this->adminUser->adminProfile->address,
            'supervisor_name' => $this->adminUser->adminProfile->supervisor_name,
            'work_location' => $this->adminUser->adminProfile->work_location,
        ];

        $response = $this->actingAs($this->adminUser)->patch(route('profile.update'), $updateData);
        $response->assertRedirect(route('profile.edit'));
        $response->assertSessionHas('success', 'Profile berhasil di update');
        $this->assertDatabaseHas('users', ['id' => $this->adminUser->id, 'email' => 'updated.admin@example.com']);
        $this->assertDatabaseHas('admin_profiles', ['user_id' => $this->adminUser->id, 'department' => 'Updated IT Department']);
    }

    public function test_dosen_can_update_their_profile(): void
    {
        $updateData = [
            'name' => 'Updated Dosen Name',
            'email' => 'updated.dosen@example.com',
            // DosenProfile specific fields
            'expertise' => 'Advanced Web Development',
            'employee_number' => $this->dosenUser->dosenProfile->employee_number, // Keep unique field same
            'last_education' => $this->dosenUser->dosenProfile->last_education,
            'academic_position' => $this->dosenUser->dosenProfile->academic_position,
            'employment_status' => 'PNS',
            'teaching_start_year' => $this->dosenUser->dosenProfile->teaching_start_year,
        ];

        $response = $this->actingAs($this->dosenUser)->patch(route('profile.update'), $updateData);
        $response->assertRedirect(route('profile.edit'));
        $this->assertDatabaseHas('users', ['id' => $this->dosenUser->id, 'email' => 'updated.dosen@example.com']);
        $this->assertDatabaseHas('dosen_profiles', ['user_id' => $this->dosenUser->id, 'expertise' => 'Advanced Web Development']);
    }

    public function test_mahasiswa_can_update_their_profile(): void
    {
        $updateData = [
            'name' => 'Updated Mahasiswa Name',
            'email' => 'updated.mahasiswa@example.com',
            // MahasiswaProfile specific fields
            'study_program' => 'Software Engineering',
            'student_number' => $this->mahasiswaUser->mahasiswaProfile->student_number, // Keep unique field same
            'class_year' => $this->mahasiswaUser->mahasiswaProfile->class_year,
            'academic_status' => 'Aktif',
            'semester' => $this->mahasiswaUser->mahasiswaProfile->semester,
        ];

        $response = $this->actingAs($this->mahasiswaUser)->patch(route('profile.update'), $updateData);
        $response->assertRedirect(route('profile.edit'));
        $this->assertDatabaseHas('users', ['id' => $this->mahasiswaUser->id, 'email' => 'updated.mahasiswa@example.com']);
        $this->assertDatabaseHas('mahasiswa_profiles', ['user_id' => $this->mahasiswaUser->id, 'study_program' => 'Software Engineering']);
    }

    public function test_profile_update_fails_with_invalid_email(): void
    {
        $otherUser = User::factory()->create(['email' => 'exists@example.com']);
        $updateData = [
            'name' => $this->dosenUser->name,
            'email' => 'exists@example.com', // Email taken by otherUser
            // DosenProfile specific fields (must be valid for the request to pass initial checks)
            'employee_number' => $this->dosenUser->dosenProfile->employee_number,
            'expertise' => $this->dosenUser->dosenProfile->expertise,
            'last_education' => $this->dosenUser->dosenProfile->last_education,
            'academic_position' => $this->dosenUser->dosenProfile->academic_position,
            'employment_status' => 'PNS',
            'teaching_start_year' => $this->dosenUser->dosenProfile->teaching_start_year,
        ];

        $response = $this->actingAs($this->dosenUser)->patch(route('profile.update'), $updateData);
        $response->assertSessionHasErrors('email');
    }

    // Delete Account Tests
    public function test_user_can_delete_their_account_with_correct_password(): void
    {
        $userToDelete = User::factory()->create(['password' => Hash::make('password123')]);
        $userToDelete->assignRole('mahasiswa'); // Any role

        $response = $this->actingAs($userToDelete)->delete(route('profile.destroy'), [
            'password' => 'password123',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Akun berhasil dihapus');
        $this->assertSoftDeleted('users', ['id' => $userToDelete->id]);
        $this->assertGuest(); // Check user is logged out
    }

    public function test_user_cannot_delete_their_account_with_incorrect_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password123')]);
        $user->assignRole('mahasiswa');

        $response = $this->actingAs($user)->delete(route('profile.destroy'), [
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertNotSoftDeleted('users', ['id' => $user->id]);
        $this->assertAuthenticatedAs($user);
    }

    // Appearance Page Test
    public function test_admin_can_view_appearance_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('appearance'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/settings/appearance'));
    }

    public function test_dosen_can_view_appearance_page(): void
    {
        $response = $this->actingAs($this->dosenUser)->get(route('appearance'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('front/settings/appearance'));
    }
}
