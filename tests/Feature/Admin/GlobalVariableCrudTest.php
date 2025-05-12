<?php

namespace Tests\Feature\Admin;

use App\Models\GlobalVariable;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str; // Added import for Str
use Tests\TestCase;

class GlobalVariableCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->adminUser = User::factory()->admin()->create();
    }

    public function test_admin_can_view_global_variable_index_page(): void
    {
        GlobalVariable::factory()->count(3)->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.global-variables.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/global-variables/index')
            ->has('globalVariables')
            ->has('meta')
        );
    }

    public function test_admin_can_view_create_global_variable_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.global-variables.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/global-variables/create'));
    }

    public function test_admin_can_store_new_global_variable(): void
    {
        $key = 'NEW_APP_SETTING';
        $variableData = [
            'key' => $key,
            'slug' => Str::slug($key), // Added slug
            'value' => 'This is a new setting value.',
            'description' => 'A description for the new setting.',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.global-variables.store'), $variableData);

        $response->assertRedirect(route('admin.global-variables.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('global_variables', ['key' => 'NEW_APP_SETTING']);
    }

    public function test_store_global_variable_fails_with_invalid_data(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.global-variables.store'), ['key' => '']); // Invalid: key is required

        $response->assertSessionHasErrors('key');
        $this->assertDatabaseMissing('global_variables', ['key' => '']);
    }

    public function test_admin_can_view_edit_global_variable_page(): void
    {
        $globalVariable = GlobalVariable::factory()->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.global-variables.edit', $globalVariable));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/global-variables/edit')
            ->has('globalVariable')
            ->where('globalVariable.id', $globalVariable->id)
        );
    }

    public function test_admin_can_update_global_variable(): void
    {
        $globalVariable = GlobalVariable::factory()->create(['key' => 'OLD_KEY', 'slug' => 'old-key']);
        $newKey = 'UPDATED_KEY_SETTING';
        $updateData = [
            'key' => $newKey,
            'slug' => Str::slug($newKey), // Added slug
            'value' => 'Updated value.',
            'description' => 'Updated description.',
            'is_active' => false,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.global-variables.update', $globalVariable), $updateData);

        $response->assertRedirect(route('admin.global-variables.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('global_variables', [
            'id' => $globalVariable->id,
            'key' => 'UPDATED_KEY_SETTING',
            'is_active' => false,
        ]);
    }

    public function test_admin_can_toggle_global_variable_status(): void
    {
        $globalVariable = GlobalVariable::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.global-variables.toggle', $globalVariable));

        $response->assertRedirect(route('admin.global-variables.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('global_variables', ['id' => $globalVariable->id, 'is_active' => false]);

        // Toggle back
        $this->actingAs($this->adminUser)->post(route('admin.global-variables.toggle', $globalVariable));
        $this->assertDatabaseHas('global_variables', ['id' => $globalVariable->id, 'is_active' => true]);
    }

    public function test_admin_can_delete_global_variable(): void
    {
        $globalVariable = GlobalVariable::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.global-variables.destroy', $globalVariable));

        $response->assertRedirect(route('admin.global-variables.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('global_variables', ['id' => $globalVariable->id]);
    }

    public function test_admin_can_bulk_delete_global_variables(): void
    {
        $var1 = GlobalVariable::factory()->create();
        $var2 = GlobalVariable::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.global-variables.destroy.bulk'), ['ids' => [$var1->id, $var2->id]]);

        $response->assertRedirect(route('admin.global-variables.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('global_variables', ['id' => $var1->id]);
        $this->assertSoftDeleted('global_variables', ['id' => $var2->id]);
    }

    public function test_non_admin_cannot_access_global_variable_admin_pages(): void
    {
        $user = User::factory()->mahasiswa()->create(); // Use mahasiswa state

        $globalVariable = GlobalVariable::factory()->create();

        $this->actingAs($user)->get(route('admin.global-variables.index'))->assertStatus(403);
        $this->actingAs($user)->get(route('admin.global-variables.create'))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.global-variables.store'), [])->assertStatus(403);
        $this->actingAs($user)->get(route('admin.global-variables.edit', $globalVariable))->assertStatus(403);
        $this->actingAs($user)->put(route('admin.global-variables.update', $globalVariable), [])->assertStatus(403);
        $this->actingAs($user)->post(route('admin.global-variables.toggle', $globalVariable))->assertStatus(403);
        $this->actingAs($user)->delete(route('admin.global-variables.destroy', $globalVariable))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.global-variables.destroy.bulk'), ['ids' => [$globalVariable->id]])->assertStatus(403);
    }
}
