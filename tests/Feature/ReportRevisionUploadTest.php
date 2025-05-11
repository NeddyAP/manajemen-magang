<?php

namespace Tests\Feature;

use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\Report;
use App\Models\User;
use App\Notifications\Reports\ReportRevisionUploaded;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReportRevisionUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $dosenUser;

    private User $mahasiswaUser;

    private Internship $internship;

    private Report $report;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Notification::fake();

        // Create roles
        Role::create(['name' => 'dosen', 'guard_name' => 'web']);
        Role::create(['name' => 'mahasiswa', 'guard_name' => 'web']);

        // Create Dosen user
        $this->dosenUser = User::factory()->create();
        $this->dosenUser->assignRole('dosen');
        DosenProfile::factory()->create(['user_id' => $this->dosenUser->id]);

        // Create Mahasiswa user
        $this->mahasiswaUser = User::factory()->create();
        $this->mahasiswaUser->assignRole('mahasiswa');
        MahasiswaProfile::factory()->create(['user_id' => $this->mahasiswaUser->id, 'advisor_id' => $this->dosenUser->id]);

        // Create Internship
        $this->internship = Internship::factory()->create(['user_id' => $this->mahasiswaUser->id]);

        // Create a report
        $this->report = Report::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswaUser->id,
            'status' => 'approved', // Default to approved for most tests
        ]);
    }

    public function test_dosen_can_upload_revision_for_approved_report()
    {
        $this->actingAs($this->dosenUser);

        $file = UploadedFile::fake()->create('revised_report.pdf', 1000, 'application/pdf');

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->report->refresh();

        Storage::disk('public')->assertExists($this->report->revised_file_path);
        $this->assertNotNull($this->report->revised_file_path);
        $this->assertNotNull($this->report->revision_uploaded_at);

        Notification::assertSentTo(
            $this->mahasiswaUser,
            ReportRevisionUploaded::class,
            function ($notification, $channels) {
                return $notification->report->id === $this->report->id;
            }
        );
    }

    public function test_dosen_can_upload_revision_for_rejected_report()
    {
        $this->actingAs($this->dosenUser);
        $this->report->update(['status' => 'rejected']);

        $file = UploadedFile::fake()->create('revised_report_rejected.pdf', 1000, 'application/pdf');

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        $this->report->refresh();
        Storage::disk('public')->assertExists($this->report->revised_file_path);
        $this->assertNotNull($this->report->revised_file_path);
        Notification::assertSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
    }

    public function test_previous_revision_file_is_deleted_when_new_one_is_uploaded()
    {
        $this->actingAs($this->dosenUser);

        // Upload first revision
        $oldFile = UploadedFile::fake()->create('old_revision.pdf', 500);
        $this->post(route('front.internships.reports.uploadRevision', [$this->internship, $this->report]), [
            'revised_file' => $oldFile,
        ]);
        $this->report->refresh();
        $oldFilePath = $this->report->revised_file_path;
        Storage::disk('public')->assertExists($oldFilePath);

        // Upload new revision
        $newFile = UploadedFile::fake()->create('new_revision.pdf', 600);
        $this->post(route('front.internships.reports.uploadRevision', [$this->internship, $this->report]), [
            'revised_file' => $newFile,
        ]);
        $this->report->refresh();
        $newFilePath = $this->report->revised_file_path;

        Storage::disk('public')->assertMissing($oldFilePath);
        Storage::disk('public')->assertExists($newFilePath);
        $this->assertNotEquals($oldFilePath, $newFilePath);
    }

    public function test_mahasiswa_cannot_upload_revision()
    {
        $this->actingAs($this->mahasiswaUser);

        $file = UploadedFile::fake()->create('mahasiswa_attempt.pdf', 100);

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertStatus(403); // Forbidden
        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
        Notification::assertNotSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
    }

    public function test_dosen_cannot_upload_revision_for_pending_report()
    {
        $this->actingAs($this->dosenUser);
        $this->report->update(['status' => 'pending']);

        $file = UploadedFile::fake()->create('pending_revision_attempt.pdf', 100);

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Tidak dapat mengunggah revisi untuk laporan yang masih pending.');

        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
        Notification::assertNotSentTo($this->mahasiswaUser, ReportRevisionUploaded::class);
    }

    public function test_revised_file_is_required()
    {
        $this->actingAs($this->dosenUser);

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            // 'revised_file' => null, // Missing
        ]);

        $response->assertSessionHasErrors('revised_file');
        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
    }

    public function test_revised_file_must_be_a_valid_file_type()
    {
        $this->actingAs($this->dosenUser);

        $file = UploadedFile::fake()->create('invalid_type.txt', 100, 'text/plain');

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertSessionHasErrors('revised_file');
        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
    }

    public function test_revised_file_must_not_exceed_max_size()
    {
        $this->actingAs($this->dosenUser);

        // Max size is 5MB (5120 KB)
        $file = UploadedFile::fake()->create('too_large_file.pdf', 6000, 'application/pdf'); // 6MB

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertSessionHasErrors('revised_file');
        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
    }

    public function test_upload_revision_to_non_existent_report_returns_404()
    {
        $this->actingAs($this->dosenUser);
        $file = UploadedFile::fake()->create('report.pdf', 100);

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $this->internship->id,
            'report' => 999, // Non-existent report ID
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertNotFound();
    }

    public function test_upload_revision_to_report_not_belonging_to_internship_returns_404()
    {
        $this->actingAs($this->dosenUser);
        $otherInternship = Internship::factory()->create(['user_id' => $this->mahasiswaUser->id]);
        // Report belongs to $this->internship, not $otherInternship
        $file = UploadedFile::fake()->create('report.pdf', 100);

        $response = $this->post(route('front.internships.reports.uploadRevision', [
            'internship' => $otherInternship->id,
            'report' => $this->report->id,
        ]), [
            'revised_file' => $file,
        ]);

        $response->assertNotFound();
        // Ensure no file was saved for the original report
        $this->report->refresh();
        $this->assertNull($this->report->revised_file_path);
    }
}
