<?php

namespace Tests\Feature\Admin;

use App\Models\Faq;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqCrudTest extends TestCase
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

    public function test_admin_can_view_faq_index_page(): void
    {
        Faq::factory()->count(3)->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.faqs.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/faqs/index')
            ->has('faqs')
            ->has('meta')
        );
    }

    public function test_admin_can_view_create_faq_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.faqs.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/faqs/create'));
    }

    public function test_admin_can_store_new_faq(): void
    {
        $faqData = [
            'question' => 'What is a new FAQ?',
            'answer' => 'This is the answer to the new FAQ.',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.faqs.store'), $faqData);

        $response->assertRedirect(route('admin.faqs.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('faqs', ['question' => 'What is a new FAQ?']);
    }

    public function test_store_faq_fails_with_invalid_data(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.faqs.store'), ['question' => '']); // Invalid: question is required

        $response->assertSessionHasErrors('question');
        $this->assertDatabaseMissing('faqs', ['question' => '']);
    }

    public function test_admin_can_view_edit_faq_page(): void
    {
        $faq = Faq::factory()->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.faqs.edit', $faq));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/faqs/edit')
            ->has('faq')
            ->where('faq.id', $faq->id)
        );
    }

    public function test_admin_can_update_faq(): void
    {
        $faq = Faq::factory()->create(['question' => 'Old Question']);
        $updateData = [
            'question' => 'Updated FAQ Question',
            'answer' => 'Updated answer.',
            'is_active' => false,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.faqs.update', $faq), $updateData);

        $response->assertRedirect(route('admin.faqs.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('faqs', [
            'id' => $faq->id,
            'question' => 'Updated FAQ Question',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_toggle_faq_status(): void
    {
        $faq = Faq::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.faqs.toggle', $faq));

        $response->assertRedirect(route('admin.faqs.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('faqs', ['id' => $faq->id, 'is_active' => false]);

        // Toggle back
        $this->actingAs($this->adminUser)->post(route('admin.faqs.toggle', $faq));
        $this->assertDatabaseHas('faqs', ['id' => $faq->id, 'is_active' => true]);
    }

    public function test_admin_can_delete_faq(): void
    {
        $faq = Faq::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.faqs.destroy', $faq));

        $response->assertRedirect(route('admin.faqs.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('faqs', ['id' => $faq->id]);
    }

    public function test_admin_can_bulk_delete_faqs(): void
    {
        $faq1 = Faq::factory()->create();
        $faq2 = Faq::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.faqs.destroy.bulk'), ['ids' => [$faq1->id, $faq2->id]]);

        $response->assertRedirect(route('admin.faqs.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('faqs', ['id' => $faq1->id]);
        $this->assertSoftDeleted('faqs', ['id' => $faq2->id]);
    }

    public function test_non_admin_cannot_access_faq_admin_pages(): void
    {
        $user = User::factory()->create(); // Regular user without admin role
        $user->assignRole('mahasiswa'); // Assign a non-admin role

        $faq = Faq::factory()->create();

        $this->actingAs($user)->get(route('admin.faqs.index'))->assertStatus(403);
        $this->actingAs($user)->get(route('admin.faqs.create'))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.faqs.store'), [])->assertStatus(403);
        $this->actingAs($user)->get(route('admin.faqs.edit', $faq))->assertStatus(403);
        $this->actingAs($user)->put(route('admin.faqs.update', $faq), [])->assertStatus(403);
        $this->actingAs($user)->post(route('admin.faqs.toggle', $faq))->assertStatus(403);
        $this->actingAs($user)->delete(route('admin.faqs.destroy', $faq))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.faqs.destroy.bulk'), ['ids' => [$faq->id]])->assertStatus(403);
    }
}
