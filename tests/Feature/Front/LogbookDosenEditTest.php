<?php

namespace Tests\Feature\Front;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\Helpers\PermissionTestHelper;
use Tests\TestCase;

class LogbookDosenEditTest extends TestCase
{
    use RefreshDatabase;

    private User $dosen;
    private User $mahasiswa;
    private User $otherDosen;
    private Internship $internship;
    private Logbook $logbook;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);
        Role::create(['name' => 'dosen', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        Role::create(['name' => 'superadmin', 'guard_name' => 'web']);

        // Create users with roles and permissions
        $this->dosen = PermissionTestHelper::createUserWithRoleAndPermissions('dosen', ['logbooks.view', 'logbooks.add_notes']);
        $this->otherDosen = PermissionTestHelper::createUserWithRoleAndPermissions('dosen', ['logbooks.view', 'logbooks.add_notes']);
        $this->mahasiswa = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa', ['logbooks.view', 'logbooks.create', 'logbooks.edit']);

        // Create an internship for the mahasiswa with the dosen as advisor
        $this->internship = PermissionTestHelper::createActiveInternshipForMahasiswa($this->mahasiswa);

        // Set the dosen as the advisor for the mahasiswa
        $this->mahasiswa->mahasiswaProfile->update(['advisor_id' => $this->dosen->id]);

        // Create a logbook entry
        $this->logbook = Logbook::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswa->id,
            'date' => now()->format('Y-m-d'),
            'activities' => 'Test activities',
            'supervisor_notes' => 'Initial supervisor notes',
        ]);
    }

    /** @test */
    public function dosen_can_view_edit_page_for_logbook_of_their_advisee()
    {
        $this->actingAs($this->dosen)
            ->get(route('front.internships.logbooks.edit', [$this->internship->id, $this->logbook->id]))
            ->assertStatus(200);
    }

    /** @test */
    public function dosen_cannot_view_edit_page_for_logbook_of_non_advisee()
    {
        $this->actingAs($this->otherDosen)
            ->get(route('front.internships.logbooks.edit', [$this->internship->id, $this->logbook->id]))
            ->assertStatus(403);
    }

    /** @test */
    public function dosen_can_update_only_supervisor_notes_field()
    {
        $updatedData = [
            'supervisor_notes' => 'Updated supervisor notes',
            // Try to update other fields that should be ignored
            'activities' => 'Updated activities',
            'date' => now()->addDay()->format('Y-m-d'),
        ];

        $this->actingAs($this->dosen)
            ->put(route('front.internships.logbooks.update', [$this->internship->id, $this->logbook->id]), $updatedData)
            ->assertRedirect(route('front.internships.logbooks.index', $this->internship))
            ->assertSessionHasNoErrors();

        // Refresh the logbook from the database
        $this->logbook->refresh();

        // Verify only supervisor_notes was updated
        $this->assertEquals('Updated supervisor notes', $this->logbook->supervisor_notes);
        $this->assertEquals('Test activities', $this->logbook->activities); // Should remain unchanged
        $this->assertEquals(now()->format('Y-m-d'), $this->logbook->date); // Should remain unchanged
    }

    /** @test */
    public function mahasiswa_can_update_all_logbook_fields_except_supervisor_notes()
    {
        $originalNotes = 'Initial supervisor notes';
        $updatedData = [
            'activities' => 'Updated activities by student',
            'date' => now()->addDay()->format('Y-m-d'),
            'supervisor_notes' => 'Attempted update by student', // This should be ignored
        ];

        $this->actingAs($this->mahasiswa)
            ->put(route('front.internships.logbooks.update', [$this->internship->id, $this->logbook->id]), $updatedData)
            ->assertRedirect(route('front.internships.logbooks.index', $this->internship))
            ->assertSessionHasNoErrors();

        // Refresh the logbook from the database
        $this->logbook->refresh();

        // Verify student can update their own fields but not supervisor_notes
        $this->assertEquals('Updated activities by student', $this->logbook->activities);
        $this->assertEquals(now()->addDay()->format('Y-m-d'), $this->logbook->date);
        $this->assertEquals($originalNotes, $this->logbook->supervisor_notes); // Should remain unchanged
    }

    /** @test */
    public function validation_works_for_dosen_updating_supervisor_notes()
    {
        // Test with very long supervisor_notes which should fail validation
        $this->actingAs($this->dosen)
            ->put(route('front.internships.logbooks.update', [$this->internship->id, $this->logbook->id]), [
                'supervisor_notes' => str_repeat('a', 300), // Too long value should fail validation
            ])
            ->assertSessionHasErrors('supervisor_notes');

        // Test with valid supervisor_notes
        $this->actingAs($this->dosen)
            ->put(route('front.internships.logbooks.update', [$this->internship->id, $this->logbook->id]), [
                'supervisor_notes' => 'Valid supervisor notes',
            ])
            ->assertSessionHasNoErrors();

        // Test with empty supervisor_notes (should be valid since we made it nullable)
        $this->actingAs($this->dosen)
            ->put(route('front.internships.logbooks.update', [$this->internship->id, $this->logbook->id]), [
                'supervisor_notes' => '',
            ])
            ->assertSessionHasNoErrors();
    }
}
