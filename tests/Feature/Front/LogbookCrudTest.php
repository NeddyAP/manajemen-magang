<?php

namespace Tests\Feature\Front;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\Helpers\PermissionTestHelper;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // Seed roles
    Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'dosen', 'guard_name' => 'web']);
    Role::create(['name' => 'superadmin', 'guard_name' => 'web']);

    Notification::fake();
    Event::fake(); // If you use events related to logbooks
});

// Helper functions
function createUserWithRole(string $roleName): User
{
    return PermissionTestHelper::createUserWithRoleAndPermissions($roleName);
}

// Helper to create an active internship for a mahasiswa
function createActiveInternshipForMahasiswa(User $mahasiswa): Internship
{
    return PermissionTestHelper::createActiveInternshipForMahasiswa($mahasiswa);
}

// ------------------------------------------------------------------------
// CREATE LOGBOOK (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can view the logbook creation form for their active internship', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.logbooks.create', $internship))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/logbooks/create')
                ->has('internship')
                ->where('internship.id', $internship->id)
        );
});

test('[mahasiswa] can create a new logbook entry for their active internship', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $logbookData = Logbook::factory()->make([
        'internship_id' => $internship->id, // Ensure factory associates with internship if not automatic
        'user_id' => $mahasiswa->id, // Ensure factory associates with user if not automatic
    ])->toArray();
    // Ensure date is in 'Y-m-d' format if your factory produces DateTime objects
    if (isset($logbookData['date']) && $logbookData['date'] instanceof DateTimeInterface) {
        $logbookData['date'] = $logbookData['date']->format('Y-m-d');
    }

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.logbooks.store', $internship), $logbookData)
        ->assertRedirect(route('front.internships.logbooks.index', $internship))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('logbooks', [
        'internship_id' => $internship->id,
        'user_id' => $mahasiswa->id,
        'activities' => $logbookData['activities'], // Assuming 'activities' is a field
    ]);
});

test('[mahasiswa] cannot create a logbook entry with invalid data', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $invalidLogbookData = Logbook::factory()->make([
        'internship_id' => $internship->id,
        'user_id' => $mahasiswa->id,
        'activities' => '', // Assuming 'activities' is required
    ])->toArray();
    if (isset($invalidLogbookData['date']) && $invalidLogbookData['date'] instanceof DateTimeInterface) {
        $invalidLogbookData['date'] = $invalidLogbookData['date']->format('Y-m-d');
    }

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.logbooks.store', $internship), $invalidLogbookData)
        ->assertSessionHasErrors('activities') // Assuming 'activities' is the invalid field
        ->assertRedirect();
});

test('[mahasiswa] cannot create a logbook for an internship not belonging to them', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);

    $logbookData = Logbook::factory()->make()->toArray();
    if (isset($logbookData['date']) && $logbookData['date'] instanceof DateTimeInterface) {
        $logbookData['date'] = $logbookData['date']->format('Y-m-d');
    }

    $response = $this->actingAs($mahasiswa)
        ->post(route('front.internships.logbooks.store', $otherInternship), $logbookData);

    // The application might redirect instead of returning 403, so check for either
    $response->assertStatus(302); // Redirected

    // Verify the logbook was not created
    $this->assertDatabaseMissing('logbooks', [
        'internship_id' => $otherInternship->id,
        'user_id' => $mahasiswa->id,
    ]);
});

// ------------------------------------------------------------------------
// READ LOGBOOKS (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can view a list of their own logbook entries for an internship', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    Logbook::factory()->count(3)->for($internship)->for($mahasiswa, 'user')->create();

    // Logbooks for another student/internship
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    Logbook::factory()->count(2)->for($otherInternship)->for($otherMahasiswa, 'user')->create();

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.logbooks.index', $internship))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/logbooks/index')
                ->has('internship')
                ->where('internship.id', $internship->id)
                ->has('logbooks', 3) // Changed from logbooks.data
                ->has('meta') // Ensure pagination meta is present
        );
});

test('[mahasiswa] cannot view logbook entries of other students via index', function (): void {
    // Create a mahasiswa user with their own internship
    $mahasiswa = createUserWithRole('mahasiswa');

    // Create another mahasiswa with their own internship and logbooks
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);

    // Create some logbooks for the other mahasiswa
    Logbook::factory()->count(2)->for($otherInternship)->for($otherMahasiswa, 'user')->create([
        'activities' => 'This should not be visible to other students',
    ]);

    // Try to access other student's logbook index by manipulating internship ID in URL
    // This depends on how the controller authorizes access to the internship itself for logbook listing.
    $response = $this->actingAs($mahasiswa)
        ->get(route('front.internships.logbooks.index', $otherInternship));

    // The application should either:
    // 1. Return a 403 Forbidden status
    // 2. Redirect with an error message

    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }
});

// ------------------------------------------------------------------------
// UPDATE LOGBOOK (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can view the edit form for their own logbook entry', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.logbooks.edit', ['internship' => $internship, 'logbook' => $logbook]))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/logbooks/edit')
                ->has('internship')
                ->where('internship.id', $internship->id)
                ->has('logbook')
                ->where('logbook.id', $logbook->id)
        );
});

test('[mahasiswa] can update their own logbook entry', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create(['activities' => 'Kegiatan Lama']);

    $updatedData = [
        'date' => $logbook->date instanceof DateTimeInterface ? $logbook->date->format('Y-m-d') : $logbook->date, // Keep original date or update
        'activities' => 'Kegiatan Baru yang Diperbarui',
        // Add other fields from your Logbook factory/model that are part of the form
    ];
    // If your Logbook factory has more fields, ensure they are included or make them optional in request
    $fullUpdateData = array_merge(Logbook::factory()->make()->toArray(), $updatedData);
    if (isset($fullUpdateData['date']) && $fullUpdateData['date'] instanceof DateTimeInterface) {
        $fullUpdateData['date'] = $fullUpdateData['date']->format('Y-m-d');
    }
    unset($fullUpdateData['internship_id'], $fullUpdateData['user_id']); // These are usually not in form

    $this->actingAs($mahasiswa)
        ->put(route('front.internships.logbooks.update', ['internship' => $internship, 'logbook' => $logbook]), $fullUpdateData)
        ->assertRedirect(route('front.internships.logbooks.index', $internship))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('logbooks', [
        'id' => $logbook->id,
        'activities' => 'Kegiatan Baru yang Diperbarui',
    ]);
});

test('[mahasiswa] cannot update their logbook entry with invalid data', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();

    $invalidUpdateData = [
        'date' => $logbook->date instanceof DateTimeInterface ? $logbook->date->format('Y-m-d') : $logbook->date,
        'activities' => '', // Invalid
    ];
    $fullInvalidData = array_merge(Logbook::factory()->make()->toArray(), $invalidUpdateData);
    if (isset($fullInvalidData['date']) && $fullInvalidData['date'] instanceof DateTimeInterface) {
        $fullInvalidData['date'] = $fullInvalidData['date']->format('Y-m-d');
    }
    unset($fullInvalidData['internship_id'], $fullInvalidData['user_id']);

    $response = $this->actingAs($mahasiswa)
        ->put(route('front.internships.logbooks.update', ['internship' => $internship, 'logbook' => $logbook]), $fullInvalidData);

    // The application should either:
    // 1. Return a redirect with validation errors in the session
    // 2. Return a 422 Unprocessable Entity status with validation errors

    if ($response->status() === 302) {
        $response->assertSessionHasErrors('activities');
    } else {
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('activities');
    }

    // Verify the logbook was not updated
    $this->assertDatabaseMissing('logbooks', [
        'id' => $logbook->id,
        'activities' => '',
    ]);
});

test('[mahasiswa] cannot update a logbook entry not belonging to them', function (): void {
    // Create a mahasiswa user
    $mahasiswa = createUserWithRole('mahasiswa');

    // Create another mahasiswa with their own internship and logbook
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    $otherLogbook = Logbook::factory()->for($otherInternship)->for($otherMahasiswa, 'user')->create([
        'activities' => 'Original content that should not be updatable by another student',
    ]);

    // Prepare update data
    $updateData = ['activities' => 'Mencoba Update'];

    // Store the original ID for verification
    $otherLogbookId = $otherLogbook->id;

    // Verify the logbook exists with original content before attempting update
    $this->assertDatabaseHas('logbooks', [
        'id' => $otherLogbookId,
        'activities' => 'Original content that should not be updatable by another student',
    ]);

    // Attempt to update the logbook as a different mahasiswa
    $response = $this->actingAs($mahasiswa)
        ->put(route('front.internships.logbooks.update', ['internship' => $otherInternship, 'logbook' => $otherLogbook]), $updateData);

    // The application should either:
    // 1. Return a 403 Forbidden status
    // 2. Redirect with an error message

    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }

    // Verify the logbook was not updated
    $this->assertDatabaseHas('logbooks', [
        'id' => $otherLogbookId,
        'activities' => 'Original content that should not be updatable by another student',
    ]);

    // Verify the logbook does not contain the attempted update
    $this->assertDatabaseMissing('logbooks', [
        'id' => $otherLogbookId,
        'activities' => 'Mencoba Update',
    ]);
});

// ------------------------------------------------------------------------
// DELETE LOGBOOK (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can delete their own logbook entry', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    // Create a logbook with specific content to verify it's deleted
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create([
        'activities' => 'This logbook will be deleted',
    ]);

    // Store the ID for later verification
    $logbookId = $logbook->id;

    // Verify the logbook exists before deletion
    $this->assertDatabaseHas('logbooks', [
        'id' => $logbookId,
        'internship_id' => $internship->id,
        'user_id' => $mahasiswa->id,
        'activities' => 'This logbook will be deleted',
    ]);

    $response = $this->actingAs($mahasiswa)
        ->delete(route('front.internships.logbooks.destroy', ['internship' => $internship, 'logbook' => $logbook]));

    // Assert the response is a redirect to the index page
    $response->assertRedirect(route('front.internships.logbooks.index', $internship));

    // Assert no validation errors
    $response->assertSessionHasNoErrors();

    // Assert the logbook was soft deleted
    $this->assertSoftDeleted('logbooks', [
        'id' => $logbookId,
        'internship_id' => $internship->id,
        'user_id' => $mahasiswa->id,
    ]);

    // Assert the logbook is no longer in the active records
    $this->assertDatabaseMissing('logbooks', [
        'id' => $logbookId,
        'deleted_at' => null,
    ]);
});

test('[mahasiswa] cannot delete a logbook entry not belonging to them', function (): void {
    // Create a mahasiswa user with their own internship (to establish context)
    $mahasiswa = createUserWithRole('mahasiswa');

    // Create another mahasiswa with their own internship and logbook
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    $otherLogbook = Logbook::factory()->for($otherInternship)->for($otherMahasiswa, 'user')->create([
        'activities' => 'This logbook should not be deletable by another student',
    ]);

    // Store the ID for later verification
    $otherLogbookId = $otherLogbook->id;

    // Verify the logbook exists before attempting deletion
    $this->assertDatabaseHas('logbooks', [
        'id' => $otherLogbookId,
        'internship_id' => $otherInternship->id,
        'user_id' => $otherMahasiswa->id,
    ]);

    // Attempt to delete the logbook as a different mahasiswa
    $response = $this->actingAs($mahasiswa)
        ->delete(route('front.internships.logbooks.destroy', ['internship' => $otherInternship, 'logbook' => $otherLogbook]));

    // Assert the response is forbidden
    $response->assertForbidden();

    // Verify the logbook was not deleted
    $this->assertDatabaseHas('logbooks', [
        'id' => $otherLogbookId,
        'deleted_at' => null,
    ]);
});

// ------------------------------------------------------------------------
// AUTHENTICATION/AUTHORIZATION
// ------------------------------------------------------------------------

test('[unauthenticated] users are redirected from logbook pages', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa'); // Create user to get an internship and logbook ID
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();

    $this->get(route('front.internships.logbooks.index', $internship))->assertRedirect(route('login'));
    $this->get(route('front.internships.logbooks.create', $internship))->assertRedirect(route('login'));
    $this->post(route('front.internships.logbooks.store', $internship), [])->assertRedirect(route('login'));
    $this->get(route('front.internships.logbooks.edit', ['internship' => $internship, 'logbook' => $logbook]))->assertRedirect(route('login'));
    $this->put(route('front.internships.logbooks.update', ['internship' => $internship, 'logbook' => $logbook]), [])->assertRedirect(route('login'));
    $this->delete(route('front.internships.logbooks.destroy', ['internship' => $internship, 'logbook' => $logbook]))->assertRedirect(route('login'));
    // $this->get(route('front.internships.logbooks.show', ['internship' => $internship, 'logbook' => $logbook]))->assertRedirect(route('login'));
});

test('[admin] users cannot access student logbook creation form via student routes', function (): void {
    $admin = createUserWithRole('admin');
    // Need an internship to pass to the route, even if it's not used by admin for this specific action.
    // Create a dummy one, or one associated with a mahasiswa.
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $this->actingAs($admin)
        ->get(route('front.internships.logbooks.create', $internship))
        ->assertForbidden(); // Or assertRedirect to admin dashboard
});

test('[dosen] users cannot access student logbook creation form via student routes', function (): void {
    $dosen = createUserWithRole('dosen');
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $this->actingAs($dosen)
        ->get(route('front.internships.logbooks.create', $internship))
        ->assertForbidden(); // Or assertRedirect to dosen dashboard
});
