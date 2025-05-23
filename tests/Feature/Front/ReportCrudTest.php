<?php

namespace Tests\Feature\Front;

use App\Models\Internship;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Helpers\PermissionTestHelper;

uses(RefreshDatabase::class);

// Statuses based on migration: 'pending', 'approved', 'rejected'
const REPORT_STATUS_PENDING = 'pending'; // Can be used for draft/submitted initial state
const REPORT_STATUS_APPROVED = 'approved';
const REPORT_STATUS_REJECTED = 'rejected';

beforeEach(function (): void {
    Storage::fake('public'); // Fake the public disk for file uploads

    // Create a student user with proper permissions
    $this->mahasiswaUser = PermissionTestHelper::createUserWithRoleAndPermissions('mahasiswa');

    // Create an active internship for the student
    $this->internship = PermissionTestHelper::createActiveInternshipForMahasiswa($this->mahasiswaUser);

    $this->actingAs($this->mahasiswaUser, 'web');

    // Define routes using named routes
    $this->indexRoute = route('front.internships.reports.index', $this->internship);
    $this->storeRoute = route('front.internships.reports.store', $this->internship);
});

// ------------------------------------------------------------------------
// CREATE REPORTS (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can submit a new report with a file', function (): void {
    $reportData = [
        'title' => 'Laporan Mingguan 1',
        'report_file' => UploadedFile::fake()->create('laporan_mingguan_1.pdf', 100, 'application/pdf'),
    ];

    $response = $this->post($this->storeRoute, $reportData);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('reports', [
        'internship_id' => $this->internship->id,
        'title' => $reportData['title'],
        'status' => REPORT_STATUS_PENDING,
    ]);

    $report = Report::where('title', $reportData['title'])->first();
    expect($report->report_file)->not->toBeNull();
    Storage::disk('public')->assertExists($report->report_file);
});

test('[mahasiswa] cannot submit a report for an internship that is not active or not theirs', function (): void {
    $otherInternship = Internship::factory()->create(['status' => 'rejected']);
    $reportData = [
        'title' => 'Laporan Tidak Sah',
        'report_file' => UploadedFile::fake()->create('laporan_tidak_sah.pdf', 100),
    ];

    $response = $this->post(route('front.internships.reports.store', $otherInternship), $reportData);
    $response->assertStatus(403);
});

// ------------------------------------------------------------------------
// READ REPORTS (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can view a list of their own submitted reports', function (): void {
    $report = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Saya (Read List)',
        'status' => REPORT_STATUS_PENDING,
    ]);
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherReport = Report::factory()->create([
        'internship_id' => $otherInternship->id,
        'user_id' => $otherUser->id,
        'title' => 'Laporan Orang Lain (Read List)',
    ]);

    $response = $this->get($this->indexRoute);
    $response->assertOk();
    $response->assertSee($report->title);
    $response->assertDontSee($otherReport->title);
});

test('[mahasiswa] can view the details (edit page) of one of their own submitted reports', function (): void {
    $report = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Saya (Read Detail)',
        'status' => REPORT_STATUS_PENDING,
    ]);

    $response = $this->get(route('front.internships.reports.edit', ['internship' => $this->internship, 'report' => $report]));
    $response->assertOk();
    $response->assertSee($report->title);
});

test('[mahasiswa] cannot view details (edit page) of reports of other students', function (): void {
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherReport = Report::factory()->create([
        'internship_id' => $otherInternship->id,
        'user_id' => $otherUser->id,
        'title' => 'Laporan Orang Lain (Read Detail Fail)',
    ]);

    $response = $this->get(route('front.internships.reports.edit', ['internship' => $otherReport->internship, 'report' => $otherReport]));
    $response->assertStatus(403);
});

// ------------------------------------------------------------------------
// UPDATE REPORTS (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can update their own report if it is in pending status', function (): void {
    $pendingReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Pending Awal (Update Test)',
        'status' => REPORT_STATUS_PENDING,
        'report_file' => 'old_pending_file_update.pdf',
    ]);
    Storage::disk('public')->put($pendingReport->report_file, 'old content update');

    $updatedData = [
        'title' => 'Laporan Pending Diperbarui',
        'report_file' => UploadedFile::fake()->create('laporan_pending_baru.pdf', 150),
    ];

    $response = $this->put(route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $pendingReport]), $updatedData);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $pendingReport->refresh();
    expect($pendingReport->title)->toBe($updatedData['title']);
    Storage::disk('public')->assertExists($pendingReport->report_file);
    Storage::disk('public')->assertMissing('old_pending_file_update.pdf');
    expect($pendingReport->report_file)->not->toBe('old_pending_file_update.pdf');
});

test('[mahasiswa] can update their own report if it is in rejected status', function (): void {
    $rejectedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Ditolak (Update Test)',
        'status' => REPORT_STATUS_REJECTED,
    ]);
    $updatedData = [
        'title' => 'Laporan Ditolak Diperbarui',
        'report_file' => UploadedFile::fake()->create('laporan_ditolak_direvisi.pdf', 120),
    ];

    $response = $this->put(route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $rejectedReport]), $updatedData);
    $response->assertRedirect();
    $rejectedReport->refresh();
    expect($rejectedReport->title)->toBe($updatedData['title']);
    Storage::disk('public')->assertExists($rejectedReport->report_file);
});

test('[mahasiswa] cannot update their own report if it has been approved', function (): void {
    $approvedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Disetujui (Cannot Update Test)',
        'status' => REPORT_STATUS_APPROVED,
    ]);

    $updatedData = ['title' => 'Judul Tidak Akan Berubah'];
    $response = $this->put(route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $approvedReport]), $updatedData);

    // The application might handle this in different ways:
    // 1. Return a 403 Forbidden status
    // 2. Redirect with an error message

    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }

    // Verify the report was not updated
    $this->assertDatabaseMissing('reports', [
        'id' => $approvedReport->id,
        'title' => 'Judul Tidak Akan Berubah',
    ]);
});

test('[mahasiswa] cannot update reports of other students', function (): void {
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherUserReport = Report::factory()->create(['internship_id' => $otherInternship->id, 'user_id' => $otherUser->id, 'status' => REPORT_STATUS_PENDING]);
    $updatedData = ['title' => 'Pembaruan Tidak Sah'];

    $response = $this->put(route('front.internships.reports.update', ['internship' => $otherInternship, 'report' => $otherUserReport]), $updatedData);
    $response->assertStatus(403);
});

// ------------------------------------------------------------------------
// DELETE REPORTS (MAHASISWA PERSPECTIVE)
// ------------------------------------------------------------------------

test('[mahasiswa] can delete their own report if it is in pending status', function (): void {
    $pendingReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_PENDING,
        'report_file' => 'file_to_delete_pending.pdf',
    ]);
    Storage::disk('public')->put($pendingReport->report_file, 'content pending delete');

    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $pendingReport]));

    $response->assertRedirect();
    $this->assertSoftDeleted('reports', ['id' => $pendingReport->id]);
    Storage::disk('public')->assertMissing($pendingReport->report_file);
});

test('[mahasiswa] cannot delete their own report if it has been approved or rejected', function (): void {
    // Test with approved report
    $approvedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_APPROVED,
    ]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $approvedReport]));

    // The application might handle this in different ways:
    // 1. Return a 403 Forbidden status
    // 2. Redirect with an error message

    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }

    // Verify the report was not deleted
    $this->assertDatabaseHas('reports', ['id' => $approvedReport->id]);

    // Test with rejected report
    $rejectedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_REJECTED,
    ]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $rejectedReport]));

    // Handle multiple valid behaviors for rejected report as well
    if ($response->status() === 302) {
        $response->assertSessionHas('error'); // Expect an error message in session
    } else {
        $response->assertStatus(403); // Or it might return a forbidden status
    }

    // Verify the report was not deleted
    $this->assertDatabaseHas('reports', ['id' => $rejectedReport->id]);
});

test('[mahasiswa] cannot delete reports of other students', function (): void {
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherUserReport = Report::factory()->create(['internship_id' => $otherInternship->id, 'user_id' => $otherUser->id, 'status' => REPORT_STATUS_PENDING]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $otherInternship, 'report' => $otherUserReport]));
    $response->assertStatus(403);
});
