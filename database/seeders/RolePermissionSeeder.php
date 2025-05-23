<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Class RolePermissionSeeder.
 *
 * @see https://spatie.be/docs/laravel-permission/v5/basic-usage/multiple-guards
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Roles
        $superadmin = Role::create(['name' => 'superadmin']);
        $admin = Role::create(['name' => 'admin']);
        $dosen = Role::create(['name' => 'dosen']);
        $mahasiswa = Role::create(['name' => 'mahasiswa']);

        // Define permissions by resource
        $permissionGroups = [
            'internships' => ['create', 'view', 'edit', 'delete', 'approve', 'reject'],
            'logbooks' => ['create', 'view', 'edit', 'delete', 'add_notes'],
            'reports' => ['create', 'view', 'edit', 'delete', 'approve', 'reject', 'comment'],
            'guidance-classes' => ['create', 'view', 'edit', 'delete', 'attend', 'take_attendance'],
            'users' => ['create', 'view', 'edit', 'delete', 'assign_role'],
            'admin' => ['dashboard.view', 'settings.edit', 'analytics.view'],
        ];

        // Create permissions
        $allPermissions = [];
        foreach ($permissionGroups as $group => $actions) {
            foreach ($actions as $action) {
                $permissionName = "$group.$action";
                Permission::create(['name' => $permissionName]);
                $allPermissions[] = $permissionName;
            }
        }

        // Assign all permissions to superadmin
        $superadmin->givePermissionTo($allPermissions);

        // Assign permissions to admin
        $admin->givePermissionTo([
            'internships.view', 'internships.approve', 'internships.reject',
            'logbooks.view', 'logbooks.add_notes',
            'reports.view', 'reports.approve', 'reports.reject', 'reports.comment',
            'guidance-classes.view', 'guidance-classes.create', 'guidance-classes.edit', 'guidance-classes.delete',
            'users.create', 'users.view', 'users.edit', 'users.delete', 'users.assign_role',
            'admin.dashboard.view', 'admin.settings.edit', 'admin.analytics.view',
        ]);

        // Assign permissions to dosen
        $dosen->givePermissionTo([
            'internships.view', 'internships.approve', 'internships.reject',
            'logbooks.view', 'logbooks.add_notes',
            'reports.view', 'reports.approve', 'reports.reject', 'reports.comment',
            'guidance-classes.create', 'guidance-classes.view', 'guidance-classes.edit', 'guidance-classes.delete', 'guidance-classes.take_attendance',
        ]);

        // Assign permissions to mahasiswa
        $mahasiswa->givePermissionTo([
            'internships.create', 'internships.view', 'internships.edit',
            'logbooks.create', 'logbooks.view', 'logbooks.edit',
            'reports.create', 'reports.view', 'reports.edit', 'reports.delete',
            'guidance-classes.view', 'guidance-classes.attend',
        ]);

        // Create and Assign Permissions
        // for ($i = 0; $i < count($permissions); $i++) {
        //     $permissionGroup = $permissions[$i]['group_name'];
        //     for ($j = 0; $j < count($permissions[$i]['permissions']); $j++) {
        //         // Create Permission
        //         $permission = Permission::create(['name' => $permissions[$i]['permissions'][$j], 'group_name' => $permissionGroup]);
        //         $roleSuperAdmin->givePermissionTo($permission);
        //         $permission->assignRole($roleSuperAdmin);
        //     }
        // }

        // // Do same for the admin guard for tutorial purposes.
        // $admin = User::where('email', 'superadmin@example.com')->first();
        // $roleSuperAdmin = $this->maybeCreateSuperAdminRole($admin);

        // // Create and Assign Permissions
        // for ($i = 0; $i < count($permissions); $i++) {
        //     // $permissionGroup = $permissions[$i]['group_name'];
        //     for ($j = 0; $j < count($permissions[$i]['permissions']); $j++) {
        //         $permissionExist = Permission::where('name', $permissions[$i]['permissions'][$j])->first();
        //         if (is_null($permissionExist)) {
        //             $permission = Permission::create(
        //                 [
        //                     'name' => $permissions[$i]['permissions'][$j],
        //                     // 'group_name' => $permissionGroup,
        //                     'guard_name' => 'admin'
        //                 ]
        //             );
        //             $roleSuperAdmin->givePermissionTo($permission);
        //             $permission->assignRole($roleSuperAdmin);
        //         }
        //     }
        // }

        // // Assign super admin role permission to superadmin user
        // if ($admin) {
        //     $admin->assignRole($roleSuperAdmin);
        // }

        // $this->command->info('Roles and Permissions created successfully!');
    }

    // private function maybeCreateSuperAdminRole($admin): Role
    // {
    //     if (is_null($admin)) {
    //         $roleSuperAdmin = Role::create(['name' => 'superadmin', 'guard_name' => 'admin']);
    //     } else {
    //         $roleSuperAdmin = Role::where('name', 'superadmin')->where('guard_name', 'admin')->first();
    //     }

    //     if (is_null($roleSuperAdmin)) {
    //         $roleSuperAdmin = Role::create(['name' => 'superadmin', 'guard_name' => 'admin']);
    //     }

    //     return $roleSuperAdmin;
    // }
}
