<?php

namespace Tests\Feature\Settings;

use App\Models\AdminProfile;
use App\Models\DosenProfile;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/settings/profile') // Admin route
                ->has('profile')
                ->where('profile.user_id', $this->adminUser->id)
        );
    }

    public function test_dosen_can_view_their_profile_edit_page(): void
    {
        $response = $this->actingAs($this->dosenUser)->get(route('profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/settings/profile') // Front route for Dosen
                ->has('profile')
                ->where('profile.user_id', $this->dosenUser->id)
        );
    }

    public function test_mahasiswa_can_view_their_profile_edit_page(): void
    {
        $response = $this->actingAs($this->mahasiswaUser)->get(route('profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
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
        Storage::fake('public'); // Ensure storage is faked for avatar deletion part
        $userToDelete = User::factory()->create([
            'password' => Hash::make('password123'),
            'avatar' => 'avatars/dummy_avatar.jpg', // Simulate an existing avatar
        ]);
        // Create a dummy avatar file for deletion check
        Storage::disk('public')->put($userToDelete->avatar, 'dummy_content');
        $this->assertTrue(Storage::disk('public')->exists($userToDelete->avatar));

        $userToDelete->assignRole('mahasiswa'); // Any role

        // Force refresh to ensure we have a User model instance that implements Authenticatable
        $userToDelete = User::find($userToDelete->id);

        $response = $this->actingAs($userToDelete)->delete(route('profile.destroy'), [
            'password' => 'password123',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Akun berhasil dihapus');
        $this->assertSoftDeleted('users', ['id' => $userToDelete->id]);
        Storage::disk('public')->assertMissing($userToDelete->avatar); // Check avatar is deleted from storage
        $this->assertGuest(); // Check user is logged out
    }

    public function test_user_cannot_delete_their_account_with_incorrect_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password123')]);
        $user->assignRole('mahasiswa');

        $userToDelete = User::find($user->id);

        $response = $this->actingAs($userToDelete)->delete(route('profile.destroy'), [
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

    public function test_user_can_upload_avatar(): void
    {
        Storage::fake('public');
        $user = $this->adminUser; // Use any authenticated user

        $file = UploadedFile::fake()->image('avatar.jpg');

        $initialProfileData = [
            'name' => $user->name,
            'email' => $user->email,
            // Include role-specific fields to pass validation if they are required by ProfileUpdateRequest
        ];

        if ($user->hasRole('admin')) {
            $initialProfileData = array_merge($initialProfileData, [
                'employee_id' => $user->adminProfile->employee_id,
                'department' => $user->adminProfile->department,
                'position' => $user->adminProfile->position,
                'employment_status' => $user->adminProfile->employment_status,
                'join_date' => $user->adminProfile->join_date->toDateString(),
                'phone_number' => $user->adminProfile->phone_number,
                'address' => $user->adminProfile->address,
                'supervisor_name' => $user->adminProfile->supervisor_name,
                'work_location' => $user->adminProfile->work_location,
            ]);
        } elseif ($user->hasRole('dosen')) {
            $initialProfileData = array_merge($initialProfileData, [
                'employee_number' => $user->dosenProfile->employee_number,
                'expertise' => $user->dosenProfile->expertise,
                'last_education' => $user->dosenProfile->last_education,
                'academic_position' => $user->dosenProfile->academic_position,
                'employment_status' => $user->dosenProfile->employment_status,
                'teaching_start_year' => $user->dosenProfile->teaching_start_year,
            ]);
        } elseif ($user->hasRole('mahasiswa')) {
            $initialProfileData = array_merge($initialProfileData, [
                'student_number' => $user->mahasiswaProfile->student_number,
                'study_program' => $user->mahasiswaProfile->study_program,
                'class_year' => $user->mahasiswaProfile->class_year,
                'academic_status' => $user->mahasiswaProfile->academic_status,
                'semester' => $user->mahasiswaProfile->semester,
            ]);
        }

        $response = $this->actingAs($user)->patch(route('profile.update'), array_merge(
            $initialProfileData,
            ['avatar' => $file]
        ));

        $response->assertRedirect(route('profile.edit'));
        $response->assertSessionHas('success', 'Profile berhasil di update');

        $user->refresh();
        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
        $this->assertTrue(str_starts_with($user->avatar, 'avatars/'));
    }

    public function test_uploading_new_avatar_deletes_old_one(): void
    {
        Storage::fake('public');
        $user = $this->adminUser;

        // Upload initial avatar
        $oldFile = UploadedFile::fake()->image('old_avatar.jpg');
        // We need to ensure all required fields for the specific role are present for the update to pass.
        // For simplicity, let's assume admin user for this test setup
        $profileData = [
            'name' => $user->name,
            'email' => $user->email,
            'employee_id' => $user->adminProfile->employee_id,
            'department' => $user->adminProfile->department,
            'position' => $user->adminProfile->position,
            'employment_status' => $user->adminProfile->employment_status,
            'join_date' => $user->adminProfile->join_date->toDateString(),
            'phone_number' => $user->adminProfile->phone_number,
            'address' => $user->adminProfile->address,
            'supervisor_name' => $user->adminProfile->supervisor_name,
            'work_location' => $user->adminProfile->work_location,
        ];

        $this->actingAs($user)->patch(route('profile.update'), array_merge($profileData, ['avatar' => $oldFile]));
        $user->refresh();
        $oldAvatarPath = $user->avatar;
        $this->assertNotNull($oldAvatarPath);
        Storage::disk('public')->assertExists($oldAvatarPath);

        // Upload new avatar
        $newFile = UploadedFile::fake()->image('new_avatar.png');
        $this->actingAs($user)->patch(route('profile.update'), array_merge($profileData, ['avatar' => $newFile]));

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertNotEquals($oldAvatarPath, $user->avatar);
        Storage::disk('public')->assertMissing($oldAvatarPath);
        Storage::disk('public')->assertExists($user->avatar);
    }

    public function test_avatar_upload_validation_fails_for_invalid_file_type(): void
    {
        Storage::fake('public');
        $user = $this->adminUser;
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $profileData = [
            'name' => $user->name,
            'email' => $user->email,
            'employee_id' => $user->adminProfile->employee_id,
            'department' => $user->adminProfile->department,
            'position' => $user->adminProfile->position,
            'employment_status' => $user->adminProfile->employment_status,
            'join_date' => $user->adminProfile->join_date->toDateString(),
            'phone_number' => $user->adminProfile->phone_number,
            'address' => $user->adminProfile->address,
            'supervisor_name' => $user->adminProfile->supervisor_name,
            'work_location' => $user->adminProfile->work_location,
        ];

        $response = $this->actingAs($user)->patch(route('profile.update'), array_merge(
            $profileData,
            ['avatar' => $file]
        ));
        $response->assertSessionHasErrors('avatar');
        $user->refresh();
        $this->assertNull($user->avatar); // Avatar should not have been saved
    }

    public function test_avatar_upload_validation_fails_for_file_too_large(): void
    {
        Storage::fake('public');
        $user = $this->adminUser;
        $file = UploadedFile::fake()->image('large_avatar.jpg')->size(3000); // 3MB, max is 2MB (2048 KB)

        $profileData = [
            'name' => $user->name,
            'email' => $user->email,
            'employee_id' => $user->adminProfile->employee_id,
            'department' => $user->adminProfile->department,
            'position' => $user->adminProfile->position,
            'employment_status' => $user->adminProfile->employment_status,
            'join_date' => $user->adminProfile->join_date->toDateString(),
            'phone_number' => $user->adminProfile->phone_number,
            'address' => $user->adminProfile->address,
            'supervisor_name' => $user->adminProfile->supervisor_name,
            'work_location' => $user->adminProfile->work_location,
        ];

        $response = $this->actingAs($user)->patch(route('profile.update'), array_merge(
            $profileData,
            ['avatar' => $file]
        ));
        $response->assertSessionHasErrors('avatar');
        $user->refresh();
        $this->assertNull($user->avatar); // Avatar should not have been saved
    }
}
