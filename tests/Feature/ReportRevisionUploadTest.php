<?php

namespace Tests\Feature;

use App\Models\Internship;
use App\Models\Report;
use App\Models\User;
use App\Notifications\Reports\ReportRevisionUploaded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\Helpers\PermissionTestHelper;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Storage::fake('public');
    Notification::fake();

    // Create roles
    Role::create(['name' => 'dosen', 'guard_name' => 'web']);
    Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'superadmin', 'guard_name' => 'web']);

    // Create Dosen user with proper permissions
    $this->dosenUser = PermissionTestHelper::createUserWithRoleAndPermissions('dosen');

    // Create Mahasiswa user with proper permissions
    $this->mahasiswaUser = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

    // Update mahasiswa profile to set advisor relationship
    $this->mahasiswaUser->mahasiswaProfile->update(['advisor_id' => $this->dosenUser->dosenProfile->id]);

    // Create Internship
    $this->internship = PermissionTestHelper::createActiveInternshipForMahasiswa($this->mahasiswaUser);

    // Create a report (default to approved status)
    $this->report = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => 'approved',
    ]);
});

// Helper function to make upload revision request
function uploadRevision($user, $internship, $report, $file = null)
{
    return test()->actingAs($user)
        ->post(route('front.internships.reports.uploadRevision', [
            'internship' => $internship->id,
            'report' => $report->id,
        ]), [
            'revised_file' => $file ?? UploadedFile::fake()->create('revision.pdf', 1000, 'application/pdf'),
        ]);
}

// ------------------------------------------------------------------------
// SUCCESSFUL REVISION UPLOADS
// ------------------------------------------------------------------------

test('[dosen] can upload revision for approved report', function (): void {
    $file = UploadedFile::fake()->create('revised_report.pdf', 1000, 'application/pdf');

    $response = uploadRevision($this->dosenUser, $this->internship, $this->report, $file);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->report->refresh();

    Storage::disk('public')->assertExists($this->report->revised_file_path);
    expect($this->report->revised_file_path)->not->toBeNull();
    expect($this->report->revision_uploaded_at)->not->toBeNull();

    Notification::assertSentTo(
        $this->mahasiswaUser,
        ReportRevisionUploaded::class,
        function ($notification) {
            return $notification->report->id === $this->report->id;
        }
    );
});

test('[dosen] can upload revision for rejected report', function (): void {
    $this->report->update(['status' => 'rejected']);

    $file = UploadedFile::fake()->create('revised_report_rejected.pdf', 1000, 'application/pdf');

    $response = uploadRevision($this->dosenUser, $this->internship, $this->report, $file);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->report->refresh();
    Storage::disk('public')->assertExists($this->report->revised_file_path);
    expect($this->report->revised_file_path)->not->toBeNull();

    Notification::assertSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
});

test('previous revision file is deleted when new one is uploaded', function (): void {
    // Upload first revision
    $oldFile = UploadedFile::fake()->create('old_revision.pdf', 500);
    uploadRevision($this->dosenUser, $this->internship, $this->report, $oldFile);

    $this->report->refresh();
    $oldFilePath = $this->report->revised_file_path;
    Storage::disk('public')->assertExists($oldFilePath);

    // Upload new revision
    $newFile = UploadedFile::fake()->create('new_revision.pdf', 600);
    uploadRevision($this->dosenUser, $this->internship, $this->report, $newFile);

    $this->report->refresh();
    $newFilePath = $this->report->revised_file_path;

    Storage::disk('public')->assertMissing($oldFilePath);
    Storage::disk('public')->assertExists($newFilePath);
    expect($oldFilePath)->not->toEqual($newFilePath);
});

// ------------------------------------------------------------------------
// AUTHORIZATION TESTS
// ------------------------------------------------------------------------

test('[mahasiswa] cannot upload revision', function (): void {
    $file = UploadedFile::fake()->create('mahasiswa_attempt.pdf', 100);

    $response = uploadRevision($this->mahasiswaUser, $this->internship, $this->report, $file);

    $response->assertStatus(403); // Forbidden

    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();

    Notification::assertNotSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
});

test('[dosen] cannot upload revision for pending report', function (): void {
    $this->report->update(['status' => 'pending']);

    $file = UploadedFile::fake()->create('pending_revision_attempt.pdf', 100);

    $response = uploadRevision($this->dosenUser, $this->internship, $this->report, $file);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Tidak dapat mengunggah revisi untuk laporan yang masih pending.');

    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();

    Notification::assertNotSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
});

// ------------------------------------------------------------------------
// VALIDATION TESTS
// ------------------------------------------------------------------------

test('revised file is required', function (): void {
    $response = test()->actingAs($this->dosenUser)
        ->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            // 'revised_file' missing
        ]);

    $response->assertSessionHasErrors('revised_file');

    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();
});

test('revised file must be a valid file type', function (): void {
    $file = UploadedFile::fake()->create('invalid_type.txt', 100, 'text/plain');

    $response = uploadRevision($this->dosenUser, $this->internship, $this->report, $file);

    $response->assertSessionHasErrors('revised_file');

    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();
});

test('revised file must not exceed max size', function (): void {
    // Max size is 5MB (5120 KB)
    $file = UploadedFile::fake()->create('too_large_file.pdf', 6000, 'application/pdf'); // 6MB

    $response = uploadRevision($this->dosenUser, $this->internship, $this->report, $file);

    $response->assertSessionHasErrors('revised_file');

    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();
});

// ------------------------------------------------------------------------
// EDGE CASES
// ------------------------------------------------------------------------

test('upload revision to non-existent report returns 404', function (): void {
    $file = UploadedFile::fake()->create('report.pdf', 100);

    $response = test()->actingAs($this->dosenUser)
        ->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => 999, // Non-existent report ID
        ]), [
            'revised_file' => $file,
        ]);

    $response->assertNotFound();
});

test('upload revision to report not belonging to internship returns 404', function (): void {
    $otherInternship = Internship::factory()->create(['user_id' => $this->mahasiswaUser->id]);
    // Report belongs to $this->internship, not $otherInternship
    $file = UploadedFile::fake()->create('report.pdf', 100);

    $response = test()->actingAs($this->dosenUser)
        ->post(route('front.internships.reports.uploadRevision', [
            'internship' => $otherInternship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

    $response->assertNotFound();

    // Ensure no file was saved for the original report
    $this->report->refresh();
    expect($this->report->revised_file_path)->toBeNull();
});
