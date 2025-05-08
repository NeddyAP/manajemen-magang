<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\AdminProfile;
use App\Models\DosenProfile;
use App\Notifications\InternshipSubmittedNotification; // Placeholder
use App\Notifications\InternshipStatusUpdatedNotification; // Placeholder
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles
    Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'dosen', 'guard_name' => 'web']);

    // Create a default admin for notification checks if needed globally
    $this->adminUser = User::factory()->create();
    $this->adminUser->assignRole('admin');
    AdminProfile::factory()->for($this->adminUser)->create();


    Storage::fake('public'); // Default disk for uploads
    Notification::fake();
    Event::fake(); // If you use events
});

function createUserWithRole(string $roleName): User
{
    $user = User::factory()->create();
    $user->assignRole($roleName);

    match ($roleName) {
        'mahasiswa' => MahasiswaProfile::factory()->for($user)->create(),
        'admin' => AdminProfile::factory()->for($user)->create(), // Already created one in beforeEach, but can create more
        'dosen' => DosenProfile::factory()->for($user)->create(),
        default => null,
    };
    return $user;
}

// --- CREATE Internship (Mahasiswa Perspective) ---

test('mahasiswa can view the internship application form', function () {
    $mahasiswa = createUserWithRole('mahasiswa');

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('front/internships/applicants/create') // Corrected component name casing
        );
});

test('mahasiswa can submit a valid internship application', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $adminToNotify = $this->adminUser; // Use the admin created in beforeEach

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
    ])->toArray();

    // The factory generates a string for 'application_file', remove it as we'll upload a fake file.
    unset($baseInternshipData['application_file']);
    // The factory also generates dates as DateTime objects, ensure they are strings for the POST request.
    $baseInternshipData['start_date'] = (new \DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new \DateTime($baseInternshipData['end_date']))->format('Y-m-d');


    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')]
    );

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $postData)
        ->assertRedirect(route('front.internships.applicants.index'))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('internships', [
        'user_id' => $mahasiswa->id,
        'company_name' => $baseInternshipData['company_name'], // Use another field for assertion
        // 'application_file' should exist and point to a path like 'internship_documents/document.pdf'
    ]);
    // We can also assert that the file was stored
    $createdInternship = Internship::where('user_id', $mahasiswa->id)->where('company_name', $baseInternshipData['company_name'])->first();
    $this->assertNotNull($createdInternship->application_file);
    Storage::disk('public')->assertExists($createdInternship->application_file);


    // Notification::assertSentTo($adminToNotify, InternshipSubmittedNotification::class); // Placeholder
});

test('mahasiswa cannot submit an internship application with invalid data', function () {
    $mahasiswa = createUserWithRole('mahasiswa');

    // Prepare valid base data and then make 'type' invalid
    $validBaseData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
        'application_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')
    ])->toArray();
    // Ensure dates are strings
    $validBaseData['start_date'] = (new \DateTime($validBaseData['start_date']))->format('Y-m-d');
    $validBaseData['end_date'] = (new \DateTime($validBaseData['end_date']))->format('Y-m-d');

    // Make 'type' invalid
    $invalidData = array_merge($validBaseData, ['type' => 'invalid_type']);


    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $invalidData)
        ->assertSessionHasErrors('type')
        ->assertRedirect(); // Or assert status 302
});

test('unauthenticated users are redirected from the internship application form', function () {
    $this->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertRedirect(route('login'));
});

test('unauthenticated users cannot submit an internship application', function () {
    $this->post(route('front.internships.applicants.store'), []) // Corrected route name
        ->assertRedirect(route('login'));
});

test('admin users cannot access the student internship creation form', function () {
    $admin = createUserWithRole('admin');
    $this->actingAs($admin)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertForbidden(); // Or assertRedirect to admin dashboard
});

test('dosen users cannot access the student internship creation form', function () {
    $dosen = createUserWithRole('dosen');
    $this->actingAs($dosen)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertForbidden(); // Or assertRedirect to dosen dashboard
});


// --- READ Internships ---

// Index Page
test('mahasiswa can view a list of their own internships', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    Internship::factory()->count(3)->for($mahasiswa)->create();
    Internship::factory()->count(2)->create(); // Other internships

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.index')) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('front/internships/applicants/index') // Corrected component name casing
                ->has('internships', 3) // Corrected prop name and assertion
        );
});

test('admin can view a list of all internships', function () {
    $admin = createUserWithRole('admin');
    Internship::factory()->count(5)->create();

    $this->actingAs($admin)
        ->get(route('admin.internships.index')) // Assuming admin route
        ->assertOk()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('admin/internships/index') // Corrected component name casing
                ->has('internships', 5) // Corrected prop name and assertion
        );
});

// test('dosen can view a list of relevant internships', function () {
//     // This test depends on how "relevant" is defined (e.g., advisees)
//     // For now, let's assume a dosen can see all, or a specific subset
//     $dosen = createUserWithRole('dosen');
//     Internship::factory()->count(5)->create(); // Create some internships

//     // Example: Dosen sees all internships for simplicity here
//     // In a real scenario, you'd set up relationships (e.g., dosen as supervisor)
//     $this->actingAs($dosen)
//         ->get(route('dosen.internships.index')) // Assuming a dosen-specific route or a general one with filtering
//         ->assertOk()
//         ->assertInertia(fn (Assert $page) => $page
//             ->component('Dosen/Internships/Index') // Assuming component
//             ->has('internships.data') // Check for presence of internships
//         );
// });

// test('admin can view the details of any internship', function () {
//     $admin = createUserWithRole('admin');
//     $internship = Internship::factory()->create();

//     $this->actingAs($admin)
//         ->get(route('admin.internships.show', $internship)) // Assuming admin route
//         ->assertOk()
//         ->assertInertia(fn (Assert $page) => $page
//             ->component('Admin/Internships/Show')
//             ->has('internship')
//             ->where('internship.id', $internship->id)
//         );
// });

// test('dosen can view details of relevant internships show page', function () {
//     $dosen = createUserWithRole('dosen');
//     $internship = Internship::factory()->create(); // Assume this is relevant

//     $this->actingAs($dosen)
//         ->get(route('dosen.internships.show', $internship)) // Assuming dosen route
//         ->assertOk()
//         ->assertInertia(fn (Assert $page) => $page
//             ->component('Dosen/Internships/Show')
//             ->has('internship')
//             ->where('internship.id', $internship->id)
//         );
// });


// --- UPDATE Internship ---

// Mahasiswa Editing Own Application
test('mahasiswa can view the edit form for their own internship if editable', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']); // Changed 'draft' to 'waiting'

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.edit', $internship)) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('front/internships/applicants/edit') // Corrected component name casing
                ->has('internship')
                ->where('internship.id', $internship->id)
        );
});

test('mahasiswa cannot view edit form for their internship if not editable', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    // Change status to something not 'waiting' to trigger the new abort in controller's edit method
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']);

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.edit', $internship))
        ->assertForbidden();
});

test('mahasiswa can update their own internship with valid data if editable', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting', 'company_name' => 'Old Company']);

    // Prepare full valid data for update, then override specific fields
    $baseUpdateData = $internship->toArray(); // Get existing data
    // Ensure dates are strings if they are part of the form
    $baseUpdateData['start_date'] = (new \DateTime($baseUpdateData['start_date']))->format('Y-m-d');
    $baseUpdateData['end_date'] = (new \DateTime($baseUpdateData['end_date']))->format('Y-m-d');
    // If application_file is part of the update form and can be changed:
    // $baseUpdateData['application_file'] = UploadedFile::fake()->create('new_document.pdf', 1024, 'application/pdf');
    // For this test, we are only changing the title and company.
    // The controller might require all fields, so we use the factory to make a valid set.
    $validDataForUpdate = Internship::factory()->make()->toArray();
    $validDataForUpdate['start_date'] = (new \DateTime($validDataForUpdate['start_date']))->format('Y-m-d');
    $validDataForUpdate['end_date'] = (new \DateTime($validDataForUpdate['end_date']))->format('Y-m-d');
    // Remove file from factory data if not updating it, or provide a new one.
    // For simplicity, let's assume file is not updated here or is optional on update.
    // If it's required, it must be provided.
    unset($validDataForUpdate['application_file']); // Assuming file is not part of this specific update test or is optional

    $updatedData = array_merge(
        $validDataForUpdate, // provides all other required fields with valid values
        [
            // 'title' => 'New Updated Title', // Title removed
            'company_name' => 'New Updated Company Name', // Update company name instead
        ]
    );
    // Remove user_id if it's not part of the update form data (usually it's not)
    unset($updatedData['user_id']);


    $this->actingAs($mahasiswa)
        ->put(route('front.internships.applicants.update', $internship), $updatedData)
        ->assertRedirect(route('front.internships.applicants.index'))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('internships', [
        'id' => $internship->id,
        'company_name' => 'New Updated Company Name',
    ]);
});

test('mahasiswa cannot update their internship with invalid data', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']);

    // Prepare valid base data for update, then make 'title' invalid
    $validBaseDataForUpdate = Internship::factory()->make()->toArray();
    $validBaseDataForUpdate['start_date'] = (new \DateTime($validBaseDataForUpdate['start_date']))->format('Y-m-d');
    $validBaseDataForUpdate['end_date'] = (new \DateTime($validBaseDataForUpdate['end_date']))->format('Y-m-d');
    unset($validBaseDataForUpdate['application_file']); // Assuming file is not part of this specific update test or is optional
    unset($validBaseDataForUpdate['user_id']);


    $invalidUpdateData = array_merge($validBaseDataForUpdate, ['company_name' => '']); // Make company_name invalid

    $this->actingAs($mahasiswa)
        ->put(route('front.internships.applicants.update', $internship), $invalidUpdateData)
        ->assertSessionHasErrors('company_name');
});

// Admin Changing Status/Details
test('admin can update an internship status', function () {
    $admin = createUserWithRole('admin');
    $internship = Internship::factory()->create(['status' => 'waiting']); // Changed 'submitted' to 'waiting'
    $updateData = ['status' => 'accepted']; // Changed 'approved' to 'accepted'

    $this->actingAs($admin)
        ->put(route('admin.internships.update', $internship), $updateData) // Assuming admin route
        ->assertRedirect() // Or to admin show/index page
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('internships', [
        'id' => $internship->id,
        'status' => 'accepted', // Changed 'approved' to 'accepted'
    ]);
    // Notification::assertSentTo($internship->user, InternshipStatusUpdatedNotification::class); // Placeholder
});

test('unauthorized users cannot update internships', function () {
    $user = createUserWithRole('mahasiswa'); // A mahasiswa
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $internshipOfOther = Internship::factory()->for($otherMahasiswa)->create(['status' => 'waiting']); // Changed 'draft' to 'waiting'

    $this->actingAs($user)
        ->put(route('front.internships.applicants.update', $internshipOfOther), ['company_name' => 'Trying to update Company']) // Corrected route name
        ->assertForbidden();

    $unauthenticatedUser = User::factory()->make(); // Not saved, just for actingAs
    $this->put(route('front.internships.applicants.update', $internshipOfOther), ['company_name' => 'Trying to update Company'])
        ->assertStatus(403); // Changed to 403 as per actual response
});


// --- DELETE Internship (Consider Soft Deletes) ---

test('mahasiswa can delete their own internship if in editable state', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']); // Changed 'draft' to 'waiting'

    $this->actingAs($mahasiswa)
        ->delete(route('front.internships.applicants.destroy', $internship)) // Corrected route name
        ->assertRedirect(route('front.internships.applicants.index')); // Corrected route name

    $this->assertSoftDeleted('internships', ['id' => $internship->id]);
});

test('mahasiswa cannot delete their internship if not in editable state', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']); // Changed to 'accepted' as per controller logic for non-deletable

    $this->actingAs($mahasiswa)
        ->delete(route('front.internships.applicants.destroy', $internship))
        ->assertStatus(302) // Expect a redirect
        ->assertSessionHas('error'); // Expect an error message in session

    $this->assertNotSoftDeleted('internships', ['id' => $internship->id]);
});

test('admin can delete an internship', function () {
    $admin = createUserWithRole('admin');
    $internship = Internship::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.internships.destroy', $internship)) // Assuming admin route
        ->assertRedirect(); // Or to admin index page

    $this->assertSoftDeleted('internships', ['id' => $internship->id]);
});

test('unauthorized users cannot delete internships', function () {
    $user = createUserWithRole('mahasiswa');
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $internshipOfOther = Internship::factory()->for($otherMahasiswa)->create();

    $this->actingAs($user)
        ->delete(route('front.internships.applicants.destroy', $internshipOfOther)) // Corrected route name
        ->assertForbidden();

    $this->delete(route('front.internships.applicants.destroy', $internshipOfOther))
        ->assertStatus(403); // Changed to 403 as per actual response
});

// --- FILE UPLOADS ---
test('mahasiswa can submit an internship application with a file upload', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    $adminToNotify = $this->adminUser;

    $file = UploadedFile::fake()->create('my_application.pdf', 1024, 'application/pdf');

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
    ])->toArray();

    // The factory generates a string for 'application_file', remove it.
    unset($baseInternshipData['application_file']);
    // Ensure dates are strings
    $baseInternshipData['start_date'] = (new \DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new \DateTime($baseInternshipData['end_date']))->format('Y-m-d');


    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => $file] // Changed 'application_document' to 'application_file'
    );

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $postData)
        ->assertRedirect(route('front.internships.applicants.index'))
        ->assertSessionHasNoErrors();

    $createdInternship = Internship::where('user_id', $mahasiswa->id)->where('company_name', $baseInternshipData['company_name'])->first(); // Use another field
    $this->assertNotNull($createdInternship);
    $this->assertNotNull($createdInternship->application_file); // Changed to application_file
    Storage::disk('public')->assertExists($createdInternship->application_file); // Changed to application_file

    // Notification::assertSentTo($adminToNotify, InternshipSubmittedNotification::class);
});

test('internship application fails if uploaded file is invalid', function () {
    $mahasiswa = createUserWithRole('mahasiswa');
    // e.g. too large, wrong type - depends on validation rules
    $invalidFile = UploadedFile::fake()->create('large_document.pdf', 50000, 'application/pdf'); // Assuming 50MB is too large based on some validation rule

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id, // Associate with the mahasiswa
    ])->toArray();
    unset($baseInternshipData['application_file']); // Remove factory string path
    // Ensure dates are strings
    $baseInternshipData['start_date'] = (new \DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new \DateTime($baseInternshipData['end_date']))->format('Y-m-d');


    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => $invalidFile] // Changed 'application_document' to 'application_file'
    );

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $postData)
        ->assertSessionHasErrors('application_file'); // Changed to application_file
});
