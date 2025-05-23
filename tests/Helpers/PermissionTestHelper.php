<?php

namespace Tests\Helpers;

use App\Models\AdminProfile;
use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionTestHelper
{
    /**
     * Create a user with the specified role and all permissions for that role.
     */
    public static function createUserWithRoleAndPermissions(string $roleName): User
    {
        // Create user
        $user = User::factory()->create();

        // Ensure role exists
        $role = Role::firstOrCreate(['name' => $roleName]);

        // Assign role to user
        $user->assignRole($role);

        // Create appropriate profile based on role
        switch ($roleName) {
            case 'mahasiswa':
                MahasiswaProfile::factory()->for($user)->create();
                // Give all mahasiswa permissions
                self::assignMahasiswaPermissions($user);
                break;
            case 'dosen':
                DosenProfile::factory()->for($user)->create();
                // Give all dosen permissions
                self::assignDosenPermissions($user);
                break;
            case 'admin':
                AdminProfile::factory()->for($user)->create();
                // Give all admin permissions
                self::assignAdminPermissions($user);
                break;
            case 'superadmin':
                AdminProfile::factory()->for($user)->create();
                // Superadmin has all permissions by default via Gate::before in AuthServiceProvider
                break;
        }

        return $user;
    }

    /**
     * Assign all mahasiswa permissions to a user.
     */
    private static function assignMahasiswaPermissions(User $user): void
    {
        $permissions = [
            'internships.create', 'internships.view', 'internships.edit',
            'logbooks.create', 'logbooks.view', 'logbooks.edit', 'logbooks.delete',
            'reports.create', 'reports.view', 'reports.edit', 'reports.delete',
            'guidance-classes.view', 'guidance-classes.attend',
        ];

        self::createAndAssignPermissions($user, $permissions);
    }

    /**
     * Assign all dosen permissions to a user.
     */
    private static function assignDosenPermissions(User $user): void
    {
        $permissions = [
            'internships.view', 'internships.approve', 'internships.reject',
            'logbooks.view', 'logbooks.add_notes',
            'reports.view', 'reports.approve', 'reports.reject', 'reports.comment',
            'guidance-classes.create', 'guidance-classes.view', 'guidance-classes.edit',
            'guidance-classes.delete', 'guidance-classes.take_attendance',
        ];

        self::createAndAssignPermissions($user, $permissions);
    }

    /**
     * Assign all admin permissions to a user.
     */
    private static function assignAdminPermissions(User $user): void
    {
        $permissions = [
            'internships.view', 'internships.approve', 'internships.reject', 'internships.delete',
            'logbooks.view', 'logbooks.add_notes', 'logbooks.delete',
            'reports.view', 'reports.approve', 'reports.reject', 'reports.comment', 'reports.delete',
            'guidance-classes.view', 'guidance-classes.create', 'guidance-classes.edit', 'guidance-classes.delete',
            'users.create', 'users.view', 'users.edit', 'users.delete', 'users.assign_role',
            'admin.dashboard.view', 'admin.settings.edit', 'admin.analytics.view',
        ];

        self::createAndAssignPermissions($user, $permissions);
    }

    /**
     * Create permissions if they don't exist and assign them to a user.
     */
    private static function createAndAssignPermissions(User $user, array $permissions): void
    {
        foreach ($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $user->givePermissionTo($permission);
        }
    }

    /**
     * Create an active internship for a mahasiswa.
     */
    public static function createActiveInternshipForMahasiswa(User $mahasiswa): Internship
    {
        return Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']);
    }
}
