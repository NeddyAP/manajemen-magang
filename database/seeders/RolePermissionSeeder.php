<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
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

        /**
         * Enable these options if you need same role and other permission for User Model
         * Else, please follow the below steps for admin guard
         */

        // Create Roles and Permissions
        $superadmin = Role::create(['name' => 'superadmin']);
        $admin = Role::create(['name' => 'admin']);
        $dosen = Role::create(['name' => 'dosen']);
        $mahasiswa = Role::create(['name' => 'mahasiswa']);

        // Create permissions
        $permissions = [
            // superadmin Permissions
            'superadmin.create',
            'superadmin.view',
            'superadmin.edit',
            'superadmin.delete',
            'superadmin.approve',

            // admin Permissions
            'admin.create',
            'admin.view',
            'admin.edit',
            'admin.delete',
            'admin.approve',

            // dosen Permissions
            'dosen.create',
            'dosen.view',
            'dosen.edit',
            'dosen.delete',
            'dosen.approve',

            // mahasiswa Permissions
            'mahasiswa.create',
            'mahasiswa.view',
            'mahasiswa.edit',
            'mahasiswa.delete',
            'mahasiswa.approve',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $superadmin->givePermissionTo([
            // superadmin Permissions
            'superadmin.create',
            'superadmin.view',
            'superadmin.edit',
            'superadmin.delete',
            'superadmin.approve',
        ]);

        // Assign permissions to roles
        $admin->givePermissionTo([
            // admin Permissions
            'admin.create',
            'admin.view',
            'admin.edit',
            'admin.delete',
            'admin.approve',
        ]);

        $dosen->givePermissionTo([
            // dosen Permissions
            'dosen.create',
            'dosen.view',
            'dosen.edit',
            'dosen.delete',
            'dosen.approve',
        ]);

        $mahasiswa->givePermissionTo([
            // mahasiswa Permissions
            'mahasiswa.create',
            'mahasiswa.view',
            'mahasiswa.edit',
            'mahasiswa.delete',
            'mahasiswa.approve',
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
