<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private Role $adminRole;

    private Role $dosenRole;

    private Role $mahasiswaRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->adminUser = User::factory()->admin()->create();

        $this->adminRole = Role::where('name', 'admin')->first();
        $this->dosenRole = Role::where('name', 'dosen')->first();
        $this->mahasiswaRole = Role::where('name', 'mahasiswa')->first();
    }

    public function test_admin_can_view_user_index_page(): void
    {
        User::factory()->count(5)->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.users.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/users/index')
                ->has('users')
                ->has('meta')
                ->has('meta.roles')
        );
    }

    public function test_admin_can_view_create_user_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.users.create'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/users/create')
                ->has('roles')
                ->has('lecturers')
        );
    }

    // Store Tests
    public function test_admin_can_store_new_admin_user_with_profile(): void
    {
        $userData = [
            'name' => 'New Admin User',
            'email' => 'newadmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => [$this->adminRole->name],
            'employee_id' => 'ADM001',
            'department' => 'IT',
            'position' => 'System Admin',
            'employment_status' => 'Tetap',
            'join_date' => now()->subYear()->format('Y-m-d'),
            'phone_number' => '081234567890',
            'address' => '123 Admin St, Admin City',
            'supervisor_name' => 'Super Visor',
            'work_location' => 'Main Office',
        ];

        $response = $this->actingAs($this->adminUser)->post(route('admin.users.store'), $userData);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['email' => 'newadmin@example.com']);
        $newUser = User::where('email', 'newadmin@example.com')->first();
        $this->assertTrue($newUser->hasRole('admin'));
        $this->assertDatabaseHas('admin_profiles', ['user_id' => $newUser->id, 'employee_id' => 'ADM001']);
    }

    public function test_admin_can_store_new_dosen_user_with_profile(): void
    {
        $userData = [
            'name' => 'New Dosen User',
            'email' => 'newdosen@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => [$this->dosenRole->name],
            'employee_number' => 'DSN001',
            'expertise' => 'Web Development',
            'last_education' => 'S2',
            'academic_position' => 'Lektor',
            'employment_status' => 'PNS',
            'teaching_start_year' => '2010',
        ];

        $response = $this->actingAs($this->adminUser)->post(route('admin.users.store'), $userData);
        $response->assertRedirect(route('admin.users.index'));
        $newUser = User::where('email', 'newdosen@example.com')->first();
        $this->assertTrue($newUser->hasRole('dosen'));
        $this->assertDatabaseHas('dosen_profiles', ['user_id' => $newUser->id, 'employee_number' => 'DSN001']);
    }

    public function test_admin_can_store_new_mahasiswa_user_with_profile(): void
    {
        $advisor = User::factory()->dosen()->create();

        $userData = [
            'name' => 'New Mahasiswa User',
            'email' => 'newmahasiswa@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => [$this->mahasiswaRole->name],
            'student_number' => 'MHS001',
            'study_program' => 'Computer Science',
            'advisor_id' => $advisor->id,
            'class_year' => (string) (now()->year - 2),
            'academic_status' => 'Aktif',
            'semester' => 5,
            'gpa' => 3.75,
        ];

        $response = $this->actingAs($this->adminUser)->post(route('admin.users.store'), $userData);
        $response->assertRedirect(route('admin.users.index'));
        $newUser = User::where('email', 'newmahasiswa@example.com')->first();
        $this->assertTrue($newUser->hasRole('mahasiswa'));
        $this->assertDatabaseHas('mahasiswa_profiles', ['user_id' => $newUser->id, 'student_number' => 'MHS001']);
    }

    public function test_admin_can_view_user_show_page(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($this->adminUser)->get(route('admin.users.show', $user));
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/users/show')
                ->has('user')
                ->where('user.id', $user->id)
        );
    }

    public function test_admin_can_view_edit_user_page(): void
    {
        $user = User::factory()->dosen()->create();

        $response = $this->actingAs($this->adminUser)->get(route('admin.users.edit', $user));
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('admin/users/edit')
                ->has('user')
                ->has('roles')
                ->has('lecturers')
                ->where('user.id', $user->id)
        );
    }

    // Update Tests
    public function test_admin_can_update_user_details_and_profile(): void
    {
        $user = User::factory()->dosen()->create();
        $user->dosenProfile()->update(['expertise' => 'Old Expertise']); // Set initial expertise

        $updateData = [
            'name' => 'Updated Dosen Name',
            'email' => 'updated.dosen@example.com',
            'roles' => [$this->dosenRole->name],
            'employee_number' => $user->dosenProfile->employee_number,
            'expertise' => 'New Updated Expertise',
            'last_education' => $user->dosenProfile->last_education ?? 'S2',
            'academic_position' => $user->dosenProfile->academic_position ?? 'Lektor',
            'employment_status' => $user->dosenProfile->employment_status ?? 'PNS',
            'teaching_start_year' => $user->dosenProfile->teaching_start_year ?? '2011',
        ];

        $response = $this->actingAs($this->adminUser)->put(route('admin.users.update', $user), $updateData);
        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'updated.dosen@example.com']);
        $this->assertDatabaseHas('dosen_profiles', ['user_id' => $user->id, 'expertise' => 'New Updated Expertise']);
    }

    public function test_admin_can_update_user_role_and_profile_is_switched(): void
    {
        $user = User::factory()->dosen()->create();
        $dosenProfileId = $user->dosenProfile->id;
        $advisor = User::factory()->dosen()->create();

        $updateData = [
            'name' => $user->name,
            'email' => $user->email,
            'roles' => [$this->mahasiswaRole->name],
            'student_number' => 'MHSNEW001',
            'study_program' => 'Engineering',
            'advisor_id' => $advisor->id,
            'class_year' => (string) (now()->year - 1),
            'academic_status' => 'Aktif',
            'semester' => 3,
            'gpa' => 3.80,
        ];

        $response = $this->actingAs($this->adminUser)->put(route('admin.users.update', $user), $updateData);
        $response->assertRedirect(route('admin.users.index'));

        $updatedUser = $user->fresh();
        $this->assertTrue($updatedUser->hasRole('mahasiswa'));
        $this->assertFalse($updatedUser->hasRole('dosen'));
        $this->assertSoftDeleted('dosen_profiles', ['id' => $dosenProfileId]);
        $this->assertDatabaseHas('mahasiswa_profiles', ['user_id' => $user->id, 'student_number' => 'MHSNEW001']);
    }

    public function test_admin_can_delete_user_and_their_profile(): void
    {
        $userToDelete = User::factory()->mahasiswa()->create();
        $profileId = $userToDelete->mahasiswaProfile->id;

        $response = $this->actingAs($this->adminUser)->delete(route('admin.users.destroy', $userToDelete));
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('users', ['id' => $userToDelete->id]);
        $this->assertSoftDeleted('mahasiswa_profiles', ['id' => $profileId]);
    }

    public function test_admin_can_bulk_delete_users_and_their_profiles(): void
    {
        $user1 = User::factory()->dosen()->create();
        $profile1Id = $user1->dosenProfile->id;
        $user2 = User::factory()->admin()->create();
        $profile2Id = $user2->adminProfile->id;

        // Route for bulk delete is POST to 'users/bulk-destroy'
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.users.destroy.bulk'), ['ids' => [$user1->id, $user2->id]]);

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('users', ['id' => $user1->id]);
        $this->assertSoftDeleted('dosen_profiles', ['id' => $profile1Id]);

        $this->assertSoftDeleted('users', ['id' => $user2->id]);
        $this->assertSoftDeleted('admin_profiles', ['id' => $profile2Id]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $response = $this->actingAs($this->adminUser)->delete(route('admin.users.destroy', $this->adminUser));
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('users', ['id' => $this->adminUser->id]);
    }
}
