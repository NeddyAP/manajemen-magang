<?php

namespace Tests\Feature\Front;

use App\Models\AdminProfile;
use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles
    Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'dosen', 'guard_name' => 'web']);

    // Create a default admin for any potential notification checks (though not primary for these tests)
    $adminUser = User::factory()->create();
    $adminUser->assignRole('admin');
    AdminProfile::factory()->for($adminUser)->create();

    Notification::fake();
    Event::fake(); // If you use events related to logbooks
});

function createUserWithRole(string $roleName): User
{
    $user = User::factory()->create();
    $user->assignRole($roleName);

    match ($roleName) {
        'mahasiswa' => MahasiswaProfile::factory()->for($user)->create(),
        'admin' => AdminProfile::factory()->for($user)->create(),
        'dosen' => DosenProfile::factory()->for($user)->create(),
        default => null,
    };

    return $user;
}

// Helper to create an active internship for a mahasiswa
function createActiveInternshipForMahasiswa(User $mahasiswa): Internship
{
    // Assuming an internship with 'accepted' or 'ongoing' status is active
    // and allows logbook entries. Adjust status if needed.
    return Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']);
}

// --- CREATE Logbook (Mahasiswa Perspective) ---

test('mahasiswa can view the logbook creation form for their active internship', function () {
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

test('mahasiswa can create a new logbook entry for their active internship', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $logbookData = Logbook::factory()->make([
        'internship_id' => $internship->id, // Ensure factory associates with internship if not automatic
        'user_id' => $mahasiswa->id, // Ensure factory associates with user if not automatic
    ])->toArray();
    // Ensure date is in 'Y-m-d' format if your factory produces DateTime objects
    if (isset($logbookData['date']) && $logbookData['date'] instanceof \DateTimeInterface) {
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

test('mahasiswa cannot create a logbook entry with invalid data', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $invalidLogbookData = Logbook::factory()->make([
        'internship_id' => $internship->id,
        'user_id' => $mahasiswa->id,
        'activities' => '', // Assuming 'activities' is required
    ])->toArray();
    if (isset($invalidLogbookData['date']) && $invalidLogbookData['date'] instanceof \DateTimeInterface) {
        $invalidLogbookData['date'] = $invalidLogbookData['date']->format('Y-m-d');
    }

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.logbooks.store', $internship), $invalidLogbookData)
        ->assertSessionHasErrors('activities') // Assuming 'activities' is the invalid field
        ->assertRedirect();
});

test('mahasiswa cannot create a logbook for an internship not belonging to them', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);

    $logbookData = Logbook::factory()->make()->toArray();
    if (isset($logbookData['date']) && $logbookData['date'] instanceof \DateTimeInterface) {
        $logbookData['date'] = $logbookData['date']->format('Y-m-d');
    }

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.logbooks.store', $otherInternship), $logbookData)
        ->assertForbidden(); // Or appropriate error status
});

// --- READ Logbooks (Mahasiswa Perspective) ---

test('mahasiswa can view a list of their own logbook entries for an internship', function () {
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

// test('mahasiswa can view the details of one of their own logbook entries', function () {
//     $mahasiswa = createUserWithRole('mahasiswa');
//     $internship = createActiveInternshipForMahasiswa($mahasiswa);
//     $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();
//
//     // Assuming a show route exists, or details are part of edit/index.
//     // If no dedicated show route, this test might need to target the edit view or assert data in index.
//     // For now, assuming a show route: front.internships.logbooks.show
//     $this->actingAs($mahasiswa)
//         ->get(route('front.internships.logbooks.show', ['internship' => $internship, 'logbook' => $logbook]))
//         ->assertOk()
//         ->assertInertia(
//             fn(Assert $page) => $page
//                 // ->component('front/internships/logbooks/show') // Adjust component name if exists
//                 ->has('logbook')
//                 ->where('logbook.id', $logbook->id)
//                 ->where('logbook.kegiatan', $logbook->kegiatan)
//         );
// });

test('mahasiswa cannot view logbook entries of other students via index', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    // Own internship, but no logbooks for it yet.
    $ownInternship = createActiveInternshipForMahasiswa($mahasiswa);

    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    Logbook::factory()->count(2)->for($otherInternship)->for($otherMahasiswa, 'user')->create();

    // Try to access other student's logbook index by manipulating internship ID in URL
    // This depends on how the controller authorizes access to the internship itself for logbook listing.
    // If the internship itself is not accessible, it should forbid.
    $this->actingAs($mahasiswa)
        ->get(route('front.internships.logbooks.index', $otherInternship))
        ->assertForbidden(); // Or assert that logbooks count is 0 if the page loads but shows no data.
});

// test('mahasiswa cannot view details of a logbook entry not belonging to them', function () {
//     $mahasiswa = createUserWithRole('mahasiswa');
//     $ownInternship = createActiveInternshipForMahasiswa($mahasiswa); // Student has an internship
//
//     $otherMahasiswa = createUserWithRole('mahasiswa');
//     $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
//     $otherLogbook = Logbook::factory()->for($otherInternship)->for($otherMahasiswa, 'user')->create();
//
//     $this->actingAs($mahasiswa)
//         ->get(route('front.internships.logbooks.show', ['internship' => $otherInternship, 'logbook' => $otherLogbook]))
//         ->assertForbidden();
// });

// --- UPDATE Logbook (Mahasiswa Perspective) ---

test('mahasiswa can view the edit form for their own logbook entry', function () {
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

test('mahasiswa can update their own logbook entry', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create(['activities' => 'Kegiatan Lama']);

    $updatedData = [
        'date' => $logbook->date instanceof \DateTimeInterface ? $logbook->date->format('Y-m-d') : $logbook->date, // Keep original date or update
        'activities' => 'Kegiatan Baru yang Diperbarui',
        // Add other fields from your Logbook factory/model that are part of the form
    ];
    // If your Logbook factory has more fields, ensure they are included or make them optional in request
    $fullUpdateData = array_merge(Logbook::factory()->make()->toArray(), $updatedData);
    if (isset($fullUpdateData['date']) && $fullUpdateData['date'] instanceof \DateTimeInterface) {
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

test('mahasiswa cannot update their logbook entry with invalid data', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();

    $invalidUpdateData = [
        'date' => $logbook->date instanceof \DateTimeInterface ? $logbook->date->format('Y-m-d') : $logbook->date,
        'activities' => '', // Invalid
    ];
    $fullInvalidData = array_merge(Logbook::factory()->make()->toArray(), $invalidUpdateData);
    if (isset($fullInvalidData['date']) && $fullInvalidData['date'] instanceof \DateTimeInterface) {
        $fullInvalidData['date'] = $fullInvalidData['date']->format('Y-m-d');
    }
    unset($fullInvalidData['internship_id'], $fullInvalidData['user_id']);

    $this->actingAs($mahasiswa)
        ->put(route('front.internships.logbooks.update', ['internship' => $internship, 'logbook' => $logbook]), $fullInvalidData)
        ->assertSessionHasErrors('activities')
        ->assertRedirect();
});

test('mahasiswa cannot update a logbook entry not belonging to them', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $ownInternship = createActiveInternshipForMahasiswa($mahasiswa); // Student has an internship

    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    $otherLogbook = Logbook::factory()->for($otherInternship)->for($otherMahasiswa, 'user')->create();

    $updateData = ['activities' => 'Mencoba Update'];

    $this->actingAs($mahasiswa)
        ->put(route('front.internships.logbooks.update', ['internship' => $otherInternship, 'logbook' => $otherLogbook]), $updateData)
        ->assertForbidden();
});

// --- DELETE Logbook (Mahasiswa Perspective) ---

test('mahasiswa can delete their own logbook entry', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);
    $logbook = Logbook::factory()->for($internship)->for($mahasiswa, 'user')->create();

    $this->actingAs($mahasiswa)
        ->delete(route('front.internships.logbooks.destroy', ['internship' => $internship, 'logbook' => $logbook]))
        ->assertRedirect(route('front.internships.logbooks.index', $internship));

    $this->assertSoftDeleted('logbooks', ['id' => $logbook->id]); // Changed to assertSoftDeleted
});

test('mahasiswa cannot delete a logbook entry not belonging to them', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $ownInternship = createActiveInternshipForMahasiswa($mahasiswa);

    $otherMahasiswa = createUserWithRole('mahasiswa');
    $otherInternship = createActiveInternshipForMahasiswa($otherMahasiswa);
    $otherLogbook = Logbook::factory()->for($otherInternship)->for($otherMahasiswa, 'user')->create();

    // $this->withoutExceptionHandling(); // Reverted: Temporarily disable exception handling

    $response = $this->actingAs($mahasiswa)
        ->delete(route('front.internships.logbooks.destroy', ['internship' => $otherInternship, 'logbook' => $otherLogbook]));

    // dd($response->getContent()); // Optional: dump content if still failing to see HTML error page

    $response->assertForbidden();

    $this->assertDatabaseHas('logbooks', ['id' => $otherLogbook->id]);
});

// --- Authentication/Authorization ---
test('unauthenticated users are redirected from logbook pages', function () {
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

test('admin users cannot access student logbook creation form via student routes', function () {
    $admin = createUserWithRole('admin');
    // Need an internship to pass to the route, even if it's not used by admin for this specific action.
    // Create a dummy one, or one associated with a mahasiswa.
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $this->actingAs($admin)
        ->get(route('front.internships.logbooks.create', $internship))
        ->assertForbidden(); // Or assertRedirect to admin dashboard
});

test('dosen users cannot access student logbook creation form via student routes', function () {
    $dosen = createUserWithRole('dosen');
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = createActiveInternshipForMahasiswa($mahasiswa);

    $this->actingAs($dosen)
        ->get(route('front.internships.logbooks.create', $internship))
        ->assertForbidden(); // Or assertRedirect to dosen dashboard
});

// Consider adding tests for "editable period" or other application-specific rules if they exist for logbooks.
// For example, if logbooks can only be edited/deleted within 24 hours of creation.
// test('mahasiswa cannot edit a logbook entry after the editable period', function () { ... });
// test('mahasiswa cannot delete a logbook entry after the editable period', function () { ... });
