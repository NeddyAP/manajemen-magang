<?php

namespace Tests\Feature\Admin;

use App\Models\Faq;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrashTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');
    }

    public function test_admin_can_view_trash_index_page(): void
    {
        $trashedUser = User::factory()->create();
        $trashedUser->delete(); // Soft delete

        $trashedFaq = Faq::factory()->create();
        $trashedFaq->delete(); // Soft delete

        $response = $this->actingAs($this->adminUser)->get(route('admin.trash.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/trash/index')
            ->has('users')
            ->has('faqs')
            // Add other models as needed if specific checks are required
            ->where('users.0.id', $trashedUser->id)
            ->where('faqs.0.id', $trashedFaq->id)
        );
    }

    public function test_admin_can_restore_a_soft_deleted_user(): void
    {
        $userToRestore = User::factory()->create();
        $userToRestore->delete(); // Soft delete

        $this->assertSoftDeleted('users', ['id' => $userToRestore->id]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.trash.restore', ['type' => 'users', 'id' => $userToRestore->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Data berhasil dipulihkan.');
        $this->assertNotSoftDeleted('users', ['id' => $userToRestore->id]);
    }

    public function test_admin_can_force_delete_a_soft_deleted_user(): void
    {
        $userToForceDelete = User::factory()->create();
        $userToForceDelete->delete(); // Soft delete

        $this->assertSoftDeleted('users', ['id' => $userToForceDelete->id]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.trash.force-delete', ['type' => 'users', 'id' => $userToForceDelete->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Data berhasil dihapus permanen.');
        $this->assertDatabaseMissing('users', ['id' => $userToForceDelete->id, 'deleted_at' => null]); // Check it's truly gone
        $this->assertFalse(User::withTrashed()->where('id', $userToForceDelete->id)->exists());
    }

    public function test_admin_can_restore_a_soft_deleted_faq(): void
    {
        $faqToRestore = Faq::factory()->create();
        $faqToRestore->delete();

        $this->assertSoftDeleted('faqs', ['id' => $faqToRestore->id]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.trash.restore', ['type' => 'faqs', 'id' => $faqToRestore->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertNotSoftDeleted('faqs', ['id' => $faqToRestore->id]);
    }

    public function test_admin_can_force_delete_a_soft_deleted_faq(): void
    {
        $faqToForceDelete = Faq::factory()->create();
        $faqToForceDelete->delete();

        $this->assertSoftDeleted('faqs', ['id' => $faqToForceDelete->id]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.trash.force-delete', ['type' => 'faqs', 'id' => $faqToForceDelete->id]));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('faqs', ['id' => $faqToForceDelete->id, 'deleted_at' => null]);
        $this->assertFalse(Faq::withTrashed()->where('id', $faqToForceDelete->id)->exists());
    }

    public function test_restore_fails_for_invalid_type(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.trash.restore', ['type' => 'invalidtype', 'id' => 999]));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Tipe data tidak valid.');
    }

    public function test_force_delete_fails_for_invalid_type(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.trash.force-delete', ['type' => 'invalidtype', 'id' => 999]));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Tipe data tidak valid.');
    }

    public function test_non_admin_cannot_access_trash_functions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mahasiswa'); // Non-admin role

        $this->actingAs($user)->get(route('admin.trash.index'))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.trash.restore', ['type' => 'users', 'id' => 1]))->assertStatus(403);
        $this->actingAs($user)->delete(route('admin.trash.force-delete', ['type' => 'users', 'id' => 1]))->assertStatus(403);
    }
}
