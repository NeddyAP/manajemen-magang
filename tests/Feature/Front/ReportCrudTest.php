<?php

namespace Tests\Feature\Front;

use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// Statuses based on migration: 'pending', 'approved', 'rejected'
const REPORT_STATUS_PENDING = 'pending'; // Can be used for draft/submitted initial state
const REPORT_STATUS_APPROVED = 'approved';
const REPORT_STATUS_REJECTED = 'rejected';

beforeEach(function () {
    Storage::fake('public'); // Fake the public disk for file uploads

    // Create a student user
    $this->mahasiswaUser = User::factory()->mahasiswa()->create();
    $this->mahasiswaProfile = MahasiswaProfile::factory()->create(['user_id' => $this->mahasiswaUser->id]);

    // Create an active internship for the student
    $this->internship = Internship::factory()->create([
        'user_id' => $this->mahasiswaUser->id,
        'status' => 'accepted', // Use 'accepted' as a valid status for an active internship
    ]);

    $this->actingAs($this->mahasiswaUser, 'web');

    // Define routes if not using route names, adjust as per your routes/web.php
    // For example:
    // $this->indexRoute = "/internships/{$this->internship->id}/reports";
    // $this->storeRoute = "/internships/{$this->internship->id}/reports";
    // $this->showRoute = fn($reportId) => "/reports/{$reportId}";
    // $this->updateRoute = fn($reportId) => "/reports/{$reportId}";
    // $this->destroyRoute = fn($reportId) => "/reports/{$reportId}";

    // Using named routes is preferred
    $this->indexRoute = route('front.internships.reports.index', $this->internship);
    $this->storeRoute = route('front.internships.reports.store', $this->internship);
    // For show, update, destroy, routes are nested under internship and report
    // e.g., route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $report])
});

// --- CREATE Reports (Mahasiswa Perspective) ---

test('[mahasiswa] can submit a new report with a file', function () {
    $reportData = [
        'title' => 'Laporan Mingguan 1',
        // 'report_type', 'content', 'report_date' do not exist in the migration
        'report_file' => UploadedFile::fake()->create('laporan_mingguan_1.pdf', 100, 'application/pdf'),
    ];

    $response = $this->post($this->storeRoute, $reportData);

    $response->assertRedirect(); // Or assertCreated() if API-like
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('reports', [
        'internship_id' => $this->internship->id,
        'title' => $reportData['title'],
        // 'report_type' removed from assertion
        'status' => REPORT_STATUS_PENDING, // Default status after submission is 'pending'
    ]);

    $report = Report::where('title', $reportData['title'])->first();
    expect($report->report_file)->not->toBeNull();
    Storage::disk('public')->assertExists($report->report_file);
});

test('[mahasiswa] cannot submit a report for an internship that is not active or not theirs', function () {
    // Example of an internship that is not 'accepted' (e.g., 'waiting' or 'rejected')
    // or belongs to another user.
    $otherInternship = Internship::factory()->create(['status' => 'rejected']);
    $reportData = [
        'title' => 'Laporan Tidak Sah',
        // 'report_type' removed
        'report_file' => UploadedFile::fake()->create('laporan_tidak_sah.pdf', 100),
    ];

    $response = $this->post(route('front.internships.reports.store', $otherInternship), $reportData);
    $response->assertStatus(403); // Or 404 if internship not found for user
});

// --- READ Reports (Mahasiswa Perspective) ---

// Note: The nested beforeEach is removed. Data setup is now within each test.

test('[mahasiswa] can view a list of their own submitted reports', function () {
    // Setup specific to this test
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
    $response->assertSee($report->title); // Use the locally created report
    $response->assertDontSee($otherReport->title);
});

test('[mahasiswa] can view the details (edit page) of one of their own submitted reports', function () {
    // Setup specific to this test
    $report = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Saya (Read Detail)',
        'status' => REPORT_STATUS_PENDING,
    ]);

    // Assuming details are viewed on the edit page if no dedicated show page exists
    $response = $this->get(route('front.internships.reports.edit', ['internship' => $this->internship, 'report' => $report]));
    $response->assertOk();
    $response->assertSee($report->title); // Use the locally created report
    // Add assertions for feedback/status if applicable on the edit page
});

test('[mahasiswa] cannot view details (edit page) of reports of other students', function () {
    // Setup specific to this test
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherReport = Report::factory()->create([
        'internship_id' => $otherInternship->id,
        'user_id' => $otherUser->id,
        'title' => 'Laporan Orang Lain (Read Detail Fail)',
    ]);

    $response = $this->get(route('front.internships.reports.edit', ['internship' => $otherReport->internship, 'report' => $otherReport]));
    $response->assertStatus(403); // Forbidden
});

// --- UPDATE Reports (Mahasiswa Perspective) ---

test('[mahasiswa] can update their own report if it is in pending status', function () {
    // Setup specific to this test
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
        // 'content' removed
        'report_file' => UploadedFile::fake()->create('laporan_pending_baru.pdf', 150),
    ];

    $response = $this->put(route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $pendingReport]), $updatedData);

    $response->assertRedirect(); // Or assertOk()
    $response->assertSessionHasNoErrors();

    $pendingReport->refresh();
    expect($pendingReport->title)->toBe($updatedData['title']);
    // expect($pendingReport->content)->toBe($updatedData['content']); // 'content' field does not exist
    Storage::disk('public')->assertExists($pendingReport->report_file);
    Storage::disk('public')->assertMissing('old_pending_file_update.pdf'); // Assuming old file is deleted
    expect($pendingReport->report_file)->not->toBe('old_pending_file_update.pdf');
});

test('[mahasiswa] can update their own report if it is in rejected status', function () {
    // Setup specific to this test
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

test('[mahasiswa] cannot update their own report if it has been approved', function () {
    // Setup specific to this test
    $approvedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'title' => 'Laporan Disetujui (Cannot Update Test)',
        'status' => REPORT_STATUS_APPROVED,
    ]);

    $updatedData = ['title' => 'Judul Tidak Akan Berubah'];
    $response = $this->put(route('front.internships.reports.update', ['internship' => $this->internship, 'report' => $approvedReport]), $updatedData);
    $response->assertStatus(403); // Forbidden
});

test('[mahasiswa] cannot update reports of other students', function () {
    // Setup specific to this test
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherUserReport = Report::factory()->create(['internship_id' => $otherInternship->id, 'user_id' => $otherUser->id, 'status' => REPORT_STATUS_PENDING]);
    $updatedData = ['title' => 'Pembaruan Tidak Sah'];

    $response = $this->put(route('front.internships.reports.update', ['internship' => $otherInternship, 'report' => $otherUserReport]), $updatedData);
    $response->assertStatus(403);
});

// --- DELETE Reports (Mahasiswa Perspective) ---

test('[mahasiswa] can delete their own report if it is in pending status', function () {
    // Setup specific to this test
    $pendingReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_PENDING,
        'report_file' => 'file_to_delete_pending.pdf',
    ]);
    Storage::disk('public')->put($pendingReport->report_file, 'content pending delete');

    // Assuming 'pending' reports are deletable (acting like a draft)
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $pendingReport]));

    $response->assertRedirect(); // Or assertNoContent()
    $this->assertSoftDeleted('reports', ['id' => $pendingReport->id]); // Use assertSoftDeleted
    Storage::disk('public')->assertMissing($pendingReport->report_file); // Assuming file is also deleted
});

test('[mahasiswa] cannot delete their own report if it has been approved or rejected', function () {
    // Setup specific to this test
    // Test approved
    $approvedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_APPROVED, // Non-deletable
    ]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $approvedReport]));
    $response->assertStatus(403);
    $this->assertDatabaseHas('reports', ['id' => $approvedReport->id]);

    // Test rejected
    $rejectedReport = Report::factory()->create([
        'internship_id' => $this->internship->id,
        'user_id' => $this->mahasiswaUser->id,
        'status' => REPORT_STATUS_REJECTED,
    ]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $this->internship, 'report' => $rejectedReport]));
    $response->assertStatus(403); // Usually rejected reports can be edited, not deleted, but depends on policy
    $this->assertDatabaseHas('reports', ['id' => $rejectedReport->id]);
});

test('[mahasiswa] cannot delete reports of other students', function () {
    // Setup specific to this test
    $otherUser = User::factory()->mahasiswa()->create();
    $otherInternship = Internship::factory()->create(['user_id' => $otherUser->id]);
    $otherUserReport = Report::factory()->create(['internship_id' => $otherInternship->id, 'user_id' => $otherUser->id, 'status' => REPORT_STATUS_PENDING]);
    $response = $this->delete(route('front.internships.reports.destroy', ['internship' => $otherInternship, 'report' => $otherUserReport]));
    $response->assertStatus(403);
});

// Helper to define Report model constants if not present in the actual model
// You might want to define these in your App\Models\Report class
// if (!defined('App\Models\Report::STATUS_DRAFT')) {
//     define('App\Models\Report::STATUS_DRAFT', 'draft');
//     define('App\Models\Report::STATUS_SUBMITTED', 'submitted');
//     define('App\Models\Report::STATUS_APPROVED', 'approved');
//     define('App\Models\Report::STATUS_REJECTED', 'rejected');
// }
