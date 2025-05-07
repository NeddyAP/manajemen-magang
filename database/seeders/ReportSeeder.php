<?php

namespace Database\Seeders;

use App\Models\Internship;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure storage directory exists
        Storage::disk('public')->makeDirectory('internships/dummy_reports');

        // Create a dummy file to use for seeding
        $dummyFilePath = Storage::disk('public')->path('internships/dummy_reports/dummy_report.pdf');
        if (! file_exists($dummyFilePath)) {
            // Create a simple dummy PDF content (or copy a real one if available)
            // This is a very basic placeholder. For real testing, use a valid PDF.
            file_put_contents($dummyFilePath, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000059 00000 n\n0000000112 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF");
        }
        $dummyStoragePath = 'internships/dummy_reports/dummy_report.pdf';

        // Get some existing internships (assuming they exist from InternshipSeeder)
        // Let's seed reports for internships associated with 'mahasiswa' users
        $mahasiswaUsers = User::whereHas('roles', function ($query) {
            $query->where('name', 'mahasiswa');
        })->pluck('id');

        $internships = Internship::whereIn('user_id', $mahasiswaUsers)
            ->where('status', 'accepted') // Only seed for accepted internships
            ->get();

        if ($internships->isEmpty()) {
            $this->command->warn('No accepted internships found for mahasiswa users. Skipping Report seeding.');

            return;
        }

        foreach ($internships as $internship) {
            // Seed 1 to 3 reports per internship
            $numberOfReports = rand(1, 3);
            for ($i = 1; $i <= $numberOfReports; $i++) {
                $status = ['pending', 'approved', 'rejected'][array_rand(['pending', 'approved', 'rejected'])];

                Report::factory()->create([
                    'user_id' => $internship->user_id,
                    'internship_id' => $internship->id,
                    'title' => 'Laporan Akhir Magang - Versi '.$i,
                    'report_file' => $dummyStoragePath, // Use the dummy file path
                    'version' => $i,
                    'status' => $status,
                    'reviewer_notes' => $status === 'rejected' ? fake()->sentence() : null,
                ]);
            }
        }
    }
}
