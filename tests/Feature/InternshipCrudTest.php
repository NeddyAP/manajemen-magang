<?php

namespace Tests\Feature;

use App\Models\Internship;
use App\Models\User;
use DateTime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
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

    // Create a default admin with proper permissions for notification checks
    $this->adminUser = PermissionTestHelper::createUserWithRoleAndPermissions('admin');

    Storage::fake('public'); // Default disk for uploads
    Notification::fake();
    Event::fake(); // If you use events
});

// Helper functions
function createUserWithRole(string $roleName): User
{
    return PermissionTestHelper::createUserWithRoleAndPermissions($roleName);
}

// ------------------------------------------------------------------------
// CREATE INTERNSHIP (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can view the internship application form', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/applicants/create') // Corrected component name casing
        );
});

test('[mahasiswa] can submit a valid internship application', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $adminToNotify = $this->adminUser; // Use the admin created in beforeEach

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
    ])->toArray();

    // The factory generates a string for 'application_file', remove it as we'll upload a fake file.
    unset($baseInternshipData['application_file']);
    unset($baseInternshipData['spp_payment_file']);
    unset($baseInternshipData['kkl_kkn_payment_file']);
    unset($baseInternshipData['practicum_payment_file']);
    // The factory also generates dates as DateTime objects, ensure they are strings for the POST request.
    $baseInternshipData['start_date'] = (new DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new DateTime($baseInternshipData['end_date']))->format('Y-m-d');

    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')],
        ['spp_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')],
        ['kkl_kkn_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')],
        ['practicum_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf')]

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
});

test('[mahasiswa] cannot submit an internship application with invalid data', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');

    // Prepare valid base data and then make 'type' invalid
    $validBaseData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
        'application_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf'),
        'spp_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf'),
        'kkl_kkn_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf'),
        'practicum_payment_file' => UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf'),
    ])->toArray();
    // Ensure dates are strings
    $validBaseData['start_date'] = (new DateTime($validBaseData['start_date']))->format('Y-m-d');
    $validBaseData['end_date'] = (new DateTime($validBaseData['end_date']))->format('Y-m-d');

    // Make 'type' invalid
    $invalidData = array_merge($validBaseData, ['type' => 'invalid_type']);

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $invalidData)
        ->assertSessionHasErrors('type')
        ->assertRedirect(); // Or assert status 302
});

test('[unauthenticated] users are redirected from the internship application form', function (): void {
    $this->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertRedirect(route('login'));
});

test('[unauthenticated] users cannot submit an internship application', function (): void {
    $this->post(route('front.internships.applicants.store'), []) // Corrected route name
        ->assertRedirect(route('login'));
});

test('[admin] users cannot access the student internship creation form', function (): void {
    $admin = createUserWithRole('admin');
    $this->actingAs($admin)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertForbidden(); // Or assertRedirect to admin dashboard
});

test('[dosen] users cannot access the student internship creation form', function (): void {
    $dosen = createUserWithRole('dosen');
    $this->actingAs($dosen)
        ->get(route('front.internships.applicants.create')) // Corrected route name
        ->assertForbidden(); // Or assertRedirect to dosen dashboard
});

// ------------------------------------------------------------------------
// READ INTERNSHIPS
// ------------------------------------------------------------------------

test('[mahasiswa] can view a list of their own internships', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    Internship::factory()->count(3)->for($mahasiswa)->create();
    Internship::factory()->count(2)->create(); // Other internships

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.index')) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/applicants/index') // Corrected component name casing
                ->has('internships', 3) // Corrected prop name and assertion
        );
});

test('[admin] can view a list of all internships', function (): void {
    $admin = createUserWithRole('admin');
    Internship::factory()->count(5)->create();

    $this->actingAs($admin)
        ->get(route('admin.internships.index')) // Assuming admin route
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('admin/internships/index') // Corrected component name casing
                ->has('internships', 5) // Corrected prop name and assertion
        );
});

// ------------------------------------------------------------------------
// UPDATE INTERNSHIP
// ------------------------------------------------------------------------

test('[mahasiswa] can view the edit form for their own internship if editable', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']);

    $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.edit', $internship)) // Corrected route name
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('front/internships/applicants/edit') // Corrected component name casing
                ->has('internship')
                ->where('internship.id', $internship->id)
        );
});

test('[mahasiswa] can view but cannot update internship if already accepted', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    // Create internship with 'accepted' status
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']);

    // For accepted internships, the application might either:
    // 1. Show the form but prevent updates (assertOk + assertForbidden on update)
    // 2. Prevent viewing the form altogether (assertForbidden on view)
    // Let's handle both cases
    $response = $this->actingAs($mahasiswa)
        ->get(route('front.internships.applicants.edit', $internship));

    // If we can view the form, then we should not be able to update
    if ($response->status() === 200) {
        // But cannot update the internship due to authorization check in UpdateInternshipRequest
        $updatedData = Internship::factory()->make([
            'company_name' => 'Updated Company Name',
        ])->toArray();

        unset($updatedData['user_id']);
        unset($updatedData['application_file']);
        unset($updatedData['spp_payment_file']);
        unset($updatedData['kkl_kkn_payment_file']);
        unset($updatedData['practicum_payment_file']);
        $updatedData['start_date'] = (new DateTime($updatedData['start_date']))->format('Y-m-d');
        $updatedData['end_date'] = (new DateTime($updatedData['end_date']))->format('Y-m-d');

        $this->actingAs($mahasiswa)
            ->put(route('front.internships.applicants.update', $internship), $updatedData)
            ->assertForbidden(); // The request is denied by the form request's authorize() method
    } else {
        // If we can't view the form, that's also acceptable behavior
        $response->assertStatus(403);
    }
});

test('[mahasiswa] can update their own internship with valid data if editable', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting', 'company_name' => 'Old Company']);

    // Prepare full valid data for update, then override specific fields
    $baseUpdateData = $internship->toArray(); // Get existing data
    // Ensure dates are strings if they are part of the form
    $baseUpdateData['start_date'] = (new DateTime($baseUpdateData['start_date']))->format('Y-m-d');
    $baseUpdateData['end_date'] = (new DateTime($baseUpdateData['end_date']))->format('Y-m-d');
    // If application_file is part of the update form and can be changed:
    // $baseUpdateData['application_file'] = UploadedFile::fake()->create('new_document.pdf', 1024, 'application/pdf');
    // For this test, we are only changing the title and company.
    // The controller might require all fields, so we use the factory to make a valid set.
    $validDataForUpdate = Internship::factory()->make()->toArray();
    $validDataForUpdate['start_date'] = (new DateTime($validDataForUpdate['start_date']))->format('Y-m-d');
    $validDataForUpdate['end_date'] = (new DateTime($validDataForUpdate['end_date']))->format('Y-m-d');
    // Remove file from factory data if not updating it, or provide a new one.
    // For simplicity, let's assume file is not updated here or is optional on update.
    // If it's required, it must be provided.
    unset($validDataForUpdate['application_file']); // Assuming file is not part of this specific update test or is optional
    unset($validDataForUpdate['spp_payment_file']);
    unset($validDataForUpdate['kkl_kkn_payment_file']);
    unset($validDataForUpdate['practicum_payment_file']);

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

test('[mahasiswa] cannot update their internship with invalid data', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']);

    // Prepare valid base data for update, then make 'title' invalid
    $validBaseDataForUpdate = Internship::factory()->make()->toArray();
    $validBaseDataForUpdate['start_date'] = (new DateTime($validBaseDataForUpdate['start_date']))->format('Y-m-d');
    $validBaseDataForUpdate['end_date'] = (new DateTime($validBaseDataForUpdate['end_date']))->format('Y-m-d');
    unset($validBaseDataForUpdate['application_file']); // Assuming file is not part of this specific update test or is optional
    unset($validBaseDataForUpdate['spp_payment_file']);
    unset($validBaseDataForUpdate['kkl_kkn_payment_file']);
    unset($validBaseDataForUpdate['practicum_payment_file']);
    unset($validBaseDataForUpdate['user_id']);

    $invalidUpdateData = array_merge($validBaseDataForUpdate, ['company_name' => '']); // Make company_name invalid

    $this->actingAs($mahasiswa)
        ->put(route('front.internships.applicants.update', $internship), $invalidUpdateData)
        ->assertSessionHasErrors('company_name');
});

test('[admin] can update an internship status', function (): void {
    $admin = createUserWithRole('admin');
    $internship = Internship::factory()->create(['status' => 'waiting']);
    $updateData = ['status' => 'accepted'];

    $this->actingAs($admin)
        ->put(route('admin.internships.update', $internship), $updateData) // Assuming admin route
        ->assertRedirect() // Or to admin show/index page
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('internships', [
        'id' => $internship->id,
        'status' => 'accepted',
    ]);
});

test('[unauthorized] users cannot update internships', function (): void {
    $user = createUserWithRole('mahasiswa'); // A mahasiswa
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $internshipOfOther = Internship::factory()->for($otherMahasiswa)->create(['status' => 'waiting']);

    $this->actingAs($user)
        ->put(route('front.internships.applicants.update', $internshipOfOther), ['company_name' => 'Trying to update Company']) // Corrected route name
        ->assertForbidden();

    $unauthenticatedUser = User::factory()->make(); // Not saved, just for actingAs
    $this->put(route('front.internships.applicants.update', $internshipOfOther), ['company_name' => 'Trying to update Company'])
        ->assertStatus(403);
});

// ------------------------------------------------------------------------
// DELETE INTERNSHIP
// ------------------------------------------------------------------------

test('[mahasiswa] can delete their own internship if in editable state', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'waiting']);

    $this->actingAs($mahasiswa)
        ->delete(route('front.internships.applicants.destroy', $internship)) // Corrected route name
        ->assertRedirect(route('front.internships.applicants.index')); // Corrected route name

    $this->assertSoftDeleted('internships', ['id' => $internship->id]);
});

test('[mahasiswa] cannot delete their internship if not in editable state', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $internship = Internship::factory()->for($mahasiswa)->create(['status' => 'accepted']);

    $response = $this->actingAs($mahasiswa)
        ->delete(route('front.internships.applicants.destroy', $internship));

    // The application might handle this in different ways:
    // 1. Return a 403 Forbidden status
    // 2. Redirect with an error message

    // Check that one of these behaviors occurs
    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }

    // Regardless of the response, the internship should not be deleted
    $this->assertNotSoftDeleted('internships', ['id' => $internship->id]);
});

test('[admin] can delete an internship', function (): void {
    $admin = createUserWithRole('admin');
    $internship = Internship::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.internships.destroy', $internship)) // Assuming admin route
        ->assertRedirect(); // Or to admin index page

    $this->assertSoftDeleted('internships', ['id' => $internship->id]);
});

test('[unauthorized] users cannot delete internships', function (): void {
    $user = createUserWithRole('mahasiswa');
    $otherMahasiswa = createUserWithRole('mahasiswa');
    $internshipOfOther = Internship::factory()->for($otherMahasiswa)->create();

    $this->actingAs($user)
        ->delete(route('front.internships.applicants.destroy', $internshipOfOther)) // Corrected route name
        ->assertForbidden();

    $this->delete(route('front.internships.applicants.destroy', $internshipOfOther))
        ->assertStatus(403);
});

// ------------------------------------------------------------------------
// FILE UPLOADS
// ------------------------------------------------------------------------

test('[mahasiswa] can submit an internship application with a file upload', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    $adminToNotify = $this->adminUser;

    $file = UploadedFile::fake()->create('my_application.pdf', 1024, 'application/pdf');

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id,
    ])->toArray();

    // The factory generates a string for 'application_file', remove it.
    unset($baseInternshipData['application_file']);
    unset($baseInternshipData['spp_payment_file']);
    unset($baseInternshipData['kkl_kkn_payment_file']);
    unset($baseInternshipData['practicum_payment_file']);
    // Ensure dates are strings
    $baseInternshipData['start_date'] = (new DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new DateTime($baseInternshipData['end_date']))->format('Y-m-d');

    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => $file],
        ['spp_payment_file' => $file],
        ['kkl_kkn_payment_file' => $file],
        ['practicum_payment_file' => $file]
    );

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $postData)
        ->assertRedirect(route('front.internships.applicants.index'))
        ->assertSessionHasNoErrors();

    $createdInternship = Internship::where('user_id', $mahasiswa->id)->where('company_name', $baseInternshipData['company_name'])->first();
    $this->assertNotNull($createdInternship);
    $this->assertNotNull($createdInternship->application_file);
    $this->assertNotNull($createdInternship->spp_payment_file);
    $this->assertNotNull($createdInternship->kkl_kkn_payment_file);
    $this->assertNotNull($createdInternship->practicum_payment_file);
    Storage::disk('public')->assertExists($createdInternship->application_file);
    Storage::disk('public')->assertExists($createdInternship->spp_payment_file);
    Storage::disk('public')->assertExists($createdInternship->kkl_kkn_payment_file);
    Storage::disk('public')->assertExists($createdInternship->practicum_payment_file);
});

test('internship application fails if uploaded file is invalid', function (): void {
    $mahasiswa = createUserWithRole('mahasiswa');
    // e.g. too large, wrong type - depends on validation rules
    $invalidFile = UploadedFile::fake()->create('large_document.pdf', 50000, 'application/pdf'); // Assuming 50MB is too large based on some validation rule

    $baseInternshipData = Internship::factory()->make([
        'user_id' => $mahasiswa->id, // Associate with the mahasiswa
    ])->toArray();
    unset($baseInternshipData['application_file']);
    unset($baseInternshipData['spp_payment_file']);
    unset($baseInternshipData['kkl_kkn_payment_file']);
    unset($baseInternshipData['practicum_payment_file']);
    $baseInternshipData['start_date'] = (new DateTime($baseInternshipData['start_date']))->format('Y-m-d');
    $baseInternshipData['end_date'] = (new DateTime($baseInternshipData['end_date']))->format('Y-m-d');

    $postData = array_merge(
        $baseInternshipData,
        ['application_file' => $invalidFile],
        ['spp_payment_file' => $invalidFile],
        ['kkl_kkn_payment_file' => $invalidFile],
        ['practicum_payment_file' => $invalidFile]
    );

    $this->actingAs($mahasiswa)
        ->post(route('front.internships.applicants.store'), $postData)
        ->assertSessionHasErrors(['application_file', 'spp_payment_file', 'kkl_kkn_payment_file', 'practicum_payment_file']);
});
