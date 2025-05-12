<?php

namespace Tests\Feature\Admin;

use App\Models\Tutorial;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TutorialCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');
        Storage::fake('public'); // Fake the public disk
    }

    public function test_admin_can_view_tutorial_index_page(): void
    {
        Tutorial::factory()->count(3)->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.tutorials.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/tutorials/index')
            ->has('tutorials')
            ->has('meta')
        );
    }

    public function test_admin_can_view_create_tutorial_page(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('admin.tutorials.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('admin/tutorials/create'));
    }

    public function test_admin_can_store_new_tutorial_with_file(): void
    {
        $file = UploadedFile::fake()->create('tutorial.pdf', 100, 'application/pdf');
        $tutorialData = [
            'title' => 'New Tutorial with File',
            'content' => 'This is the content.',
            'file_name' => 'tutorial.pdf', // Added file_name
            'access_level' => 'all', // Added access_level
            'is_active' => true,
            'file_path' => $file,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.tutorials.store'), $tutorialData);

        $response->assertRedirect(route('admin.tutorials.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('tutorials', ['title' => 'New Tutorial with File']);
        $tutorial = Tutorial::where('title', 'New Tutorial with File')->first();
        Storage::disk('public')->assertExists($tutorial->file_path);
    }

    // public function test_admin_can_store_new_tutorial_without_file(): void
    // {
    //     // This test is invalid as file_path is required by StoreTutorialRequest and DB schema
    //     $tutorialData = [
    //         'title' => 'New Tutorial No File',
    //         'content' => 'This is the content.',
    //         'file_name' => 'No File Tutorial', // Added file_name
    //         'access_level' => 'all', // Added access_level
    //         'is_active' => true,
    //         // 'file_path' is intentionally omitted, but this will fail validation
    //     ];

    //     $response = $this->actingAs($this->adminUser)
    //         ->post(route('admin.tutorials.store'), $tutorialData);

    //     // Expect validation error, not redirect and success
    //     $response->assertSessionHasErrors('file_path');
    //     // $response->assertRedirect(route('admin.tutorials.index'));
    //     // $response->assertSessionHas('success');
    //     // $this->assertDatabaseHas('tutorials', ['title' => 'New Tutorial No File', 'file_path' => null]);
    // }

    public function test_store_tutorial_fails_with_invalid_data(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.tutorials.store'), ['title' => '']); // Invalid: title is required
        $response->assertSessionHasErrors('title');
    }

    public function test_admin_can_view_edit_tutorial_page(): void
    {
        $tutorial = Tutorial::factory()->create();
        $response = $this->actingAs($this->adminUser)->get(route('admin.tutorials.edit', $tutorial));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/tutorials/edit')
            ->has('tutorial')
            ->where('tutorial.id', $tutorial->id)
        );
    }

    public function test_admin_can_update_tutorial_with_new_file(): void
    {
        $tutorial = Tutorial::factory()->create(['file_path' => UploadedFile::fake()->create('old.pdf')->store('tutorials', 'public')]);
        $oldFilePath = $tutorial->file_path;
        $newFile = UploadedFile::fake()->create('new_tutorial.pdf', 100, 'application/pdf');

        $updateData = [
            'title' => 'Updated Tutorial Title with New File',
            'content' => 'Updated content.',
            'file_name' => 'new_tutorial.pdf', // Added file_name
            'access_level' => 'dosen', // Added access_level
            'is_active' => false,
            'file_path' => $newFile,
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.tutorials.update', $tutorial), $updateData);

        $response->assertRedirect(route('admin.tutorials.index'));
        $response->assertSessionHas('success');
        $updatedTutorial = $tutorial->fresh();
        $this->assertEquals('Updated Tutorial Title with New File', $updatedTutorial->title);
        Storage::disk('public')->assertMissing($oldFilePath);
        Storage::disk('public')->assertExists($updatedTutorial->file_path);
        $this->assertNotEquals($oldFilePath, $updatedTutorial->file_path);
    }

    public function test_admin_can_update_tutorial_without_changing_file(): void
    {
        $tutorial = Tutorial::factory()->create(['file_path' => UploadedFile::fake()->create('existing.pdf')->store('tutorials', 'public')]);
        $existingFilePath = $tutorial->file_path;

        $updateData = [
            'title' => 'Updated Tutorial Title, Same File',
            'content' => 'Updated content.',
            'file_name' => $tutorial->file_name, // Use existing file_name
            'access_level' => $tutorial->access_level, // Use existing access_level
            'is_active' => true,
            // No file_path sent, so it should keep the old one
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.tutorials.update', $tutorial), $updateData);

        $response->assertRedirect(route('admin.tutorials.index'));
        $response->assertSessionHas('success');
        $updatedTutorial = $tutorial->fresh();
        $this->assertEquals('Updated Tutorial Title, Same File', $updatedTutorial->title);
        $this->assertEquals($existingFilePath, $updatedTutorial->file_path);
        Storage::disk('public')->assertExists($existingFilePath);
    }

    public function test_admin_can_toggle_tutorial_status(): void
    {
        $tutorial = Tutorial::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.tutorials.toggle', $tutorial));

        $response->assertRedirect(); // Redirects back
        $response->assertSessionHas('success');
        $this->assertFalse($tutorial->fresh()->is_active);

        // Toggle back
        $this->actingAs($this->adminUser)->post(route('admin.tutorials.toggle', $tutorial));
        $this->assertTrue($tutorial->fresh()->is_active);
    }

    public function test_admin_can_delete_tutorial_with_file(): void
    {
        $file = UploadedFile::fake()->create('to_delete.pdf')->store('tutorials', 'public');
        $tutorial = Tutorial::factory()->create(['file_path' => $file, 'file_name' => 'to_delete.pdf']);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.tutorials.destroy', $tutorial));

        $response->assertRedirect(route('admin.tutorials.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('tutorials', ['id' => $tutorial->id]);
        Storage::disk('public')->assertMissing($file);
    }

    // public function test_admin_can_delete_tutorial_without_file(): void
    // {
    //     // Invalid test: file_path is not nullable in DB for new entries as per StoreTutorialRequest
    //     // And factory always creates a file_path.
    //     // If a tutorial could exist without a file (e.g. file removed via update), this test might be different.
    //     // For now, commenting out as it contradicts current setup.
    //     // $tutorial = Tutorial::factory()->create(['file_path' => null, 'file_name' => 'no_file.txt']);

    //     // $response = $this->actingAs($this->adminUser)
    //     //     ->delete(route('admin.tutorials.destroy', $tutorial));

    //     // $response->assertRedirect(route('admin.tutorials.index'));
    //     // $response->assertSessionHas('success');
    //     // $this->assertSoftDeleted('tutorials', ['id' => $tutorial->id]);
    // }

    public function test_admin_can_bulk_delete_tutorials(): void
    {
        $file1 = UploadedFile::fake()->create('bulk1.pdf')->store('tutorials', 'public');
        $tutorial1 = Tutorial::factory()->create(['file_path' => $file1, 'file_name' => 'bulk1.pdf']);
        // For tutorial2, ensure factory provides a valid file_path and file_name as per its definition
        $tutorial2 = Tutorial::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.tutorials.destroy.bulk'), ['ids' => [$tutorial1->id, $tutorial2->id]]);

        $response->assertRedirect(route('admin.tutorials.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('tutorials', ['id' => $tutorial1->id]);
        $this->assertSoftDeleted('tutorials', ['id' => $tutorial2->id]);
        Storage::disk('public')->assertMissing($file1);
        if ($tutorial2->file_path) { // Check if factory actually created a file path for tutorial2 that needs cleanup
            Storage::disk('public')->assertMissing($tutorial2->file_path);
        }
    }

    public function test_non_admin_cannot_access_tutorial_admin_pages(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mahasiswa');

        $tutorial = Tutorial::factory()->create();

        $this->actingAs($user)->get(route('admin.tutorials.index'))->assertStatus(403);
        $this->actingAs($user)->get(route('admin.tutorials.create'))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.tutorials.store'), [])->assertStatus(403);
        $this->actingAs($user)->get(route('admin.tutorials.edit', $tutorial))->assertStatus(403);
        $this->actingAs($user)->put(route('admin.tutorials.update', $tutorial), [])->assertStatus(403);
        $this->actingAs($user)->post(route('admin.tutorials.toggle', $tutorial))->assertStatus(403);
        $this->actingAs($user)->delete(route('admin.tutorials.destroy', $tutorial))->assertStatus(403);
        $this->actingAs($user)->post(route('admin.tutorials.destroy.bulk'), ['ids' => [$tutorial->id]])->assertStatus(403);
    }
}
