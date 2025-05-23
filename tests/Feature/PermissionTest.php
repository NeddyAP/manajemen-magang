<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Helpers\PermissionTestHelper;
use Tests\TestCase;

class PermissionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user with the correct permission can view internships.
     */
    public function test_user_with_permission_can_view_internships(): void
    {
        // Create a mahasiswa user with proper permissions
        $user = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

        // Act as the user and visit the internships page
        $response = $this->actingAs($user)->get(route('front.internships.applicants.index'));

        // Assert that the user can access the page
        $response->assertStatus(200);
    }

    /**
     * Test that a user without the correct permission cannot view internships.
     */
    public function test_user_without_permission_cannot_view_internships(): void
    {
        // Create a user without any permissions
        $user = User::factory()->create();

        // Act as the user and try to visit the internships page
        $response = $this->actingAs($user)->get(route('front.internships.applicants.index'));

        // Assert that the user is redirected or gets a 403 response
        $response->assertStatus(403);
    }

    /**
     * Test that a superadmin can access any resource regardless of specific permissions.
     */
    public function test_superadmin_can_access_any_resource(): void
    {
        // Create a superadmin user with all permissions
        $user = PermissionTestHelper::createUserWithRoleAndPermissions('superadmin');

        // Act as the user and visit various pages
        $response1 = $this->actingAs($user)->get(route('front.internships.applicants.index'));
        $response2 = $this->actingAs($user)->get(route('admin.dashboard'));

        // Assert that the superadmin can access all pages
        $response1->assertStatus(200);
        $response2->assertStatus(200);
    }

    /**
     * Test that a user with the correct permission can create an internship.
     */
    public function test_user_with_permission_can_create_internship(): void
    {
        // Create a mahasiswa user with proper permissions
        $user = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

        // Act as the user and visit the create internship page
        $response = $this->actingAs($user)->get(route('front.internships.applicants.create'));

        // Assert that the user can access the page
        $response->assertStatus(200);
    }

    /**
     * Test that a user with the correct permission can view logbooks.
     */
    public function test_user_with_permission_can_view_logbooks(): void
    {
        // Create a mahasiswa user with proper permissions
        $user = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

        // Create an internship for the user
        $internship = PermissionTestHelper::createActiveInternshipForMahasiswa($user);

        // Act as the user and visit the logbooks page
        $response = $this->actingAs($user)->get(route('front.internships.logbooks.index', $internship));

        // Assert that the user can access the page
        $response->assertStatus(200);
    }

    /**
     * Test that a user with the correct permission can view reports.
     */
    public function test_user_with_permission_can_view_reports(): void
    {
        // Create a mahasiswa user with proper permissions
        $user = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

        // Create an internship for the user
        $internship = PermissionTestHelper::createActiveInternshipForMahasiswa($user);

        // Act as the user and visit the reports page
        $response = $this->actingAs($user)->get(route('front.internships.reports.index', $internship));

        // Assert that the user can access the page
        $response->assertStatus(200);
    }
}
