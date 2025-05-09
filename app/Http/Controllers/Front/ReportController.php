<?php

namespace App\Http\Controllers\Front; // Corrected namespace

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReportRequest; // Add DosenProfile
use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\Report;
use App\Models\User; // Import UpdateReportRequest
use App\Notifications\Reports\ReportStatusChanged; // Import Status Changed Notification
use App\Notifications\Reports\ReportSubmitted; // Import Notification
use Illuminate\Http\Request; // Keep for store method maybe? Or remove if not used elsewhere
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function internList(Request $request)
    {
        $user = Auth::user();
        $query = Internship::query()->where('status', 'accepted');
        $search = $request->input('search'); // Get search term

        if ($user->hasRole('dosen')) {
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                $adviseeUserIds = MahasiswaProfile::where('advisor_id', $dosenProfile->user_id)
                    ->pluck('user_id')
                    ->toArray();
                $query->whereIn('user_id', $adviseeUserIds);

                // Apply search if term exists
                if ($search) {
                    $query->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($search) {
                                $profileQuery->where('student_number', 'like', "%{$search}%");
                            });
                    });
                }

            } else {
                $query->whereRaw('1 = 0'); // No advisees, show nothing
            }
        } elseif ($user->hasRole('mahasiswa')) {
            $query->where('user_id', $user->id);
        } else {
            $query->whereRaw('1 = 0'); // Other roles see nothing here
        }

        // Eager load user details and count reports
        $internships = $query->with(['user:id,name']) // Load user name
            ->withCount('reports') // Count related reports
            ->get();

        return Inertia::render('front/internships/reports/intern-list', [ // Updated view path
            'internships' => $internships, // Includes reports_count
            'filters' => ['search' => $search], // Pass search term back to view
        ]);
    }

    public function index(Request $request, Internship $internship)
    {
        $user = Auth::user();
        $isOwner = $internship->user_id === $user->id;
        $isAdvisor = false;

        if ($user->hasRole('dosen')) {
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                $adviseeProfile = MahasiswaProfile::where('user_id', $internship->user_id)
                    ->where('advisor_id', $dosenProfile->user_id)
                    ->first();
                $isAdvisor = (bool) $adviseeProfile;
            }
        }

        // Authorization checks: Must be owner or advisor, and internship accepted
        if ((! $isOwner && ! $isAdvisor) || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized access or internship not accepted.');
        }

        $query = $internship->reports(); // Use reports relationship

        // Handle search (search by title)
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where('title', 'like', "%{$searchTerm}%");
        }

        // Handle status filter
        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Clone query for analytics *after* initial checks but before pagination
        $analyticsQuery = $internship->reports(); // Base query for this internship's reports

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $reports = $query->paginate($perPage)->withQueryString();

        // Calculate analytics for the specific internship
        $reportStats = $analyticsQuery
            ->select(
                DB::raw('count(*) as total'),
                DB::raw("sum(case when status = 'pending' then 1 else 0 end) as pending"),
                DB::raw("sum(case when status = 'approved' then 1 else 0 end) as approved"),
                DB::raw("sum(case when status = 'rejected' then 1 else 0 end) as rejected")
            )
            ->first();

        return Inertia::render('front/internships/reports/index', [
            'internship' => $internship->load('user:id,name'), // Load user for context
            'reports' => $reports->items(),
            'reportStats' => $reportStats, // Pass stats to the view
            'meta' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    public function create(Internship $internship)
    {
        // Authorization checks: Only owner can create
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat menambah laporan untuk magang yang telah disetujui.');
        }

        return Inertia::render('front/internships/reports/create', [ // Updated view path
            'internship' => $internship,
        ]);
    }

    public function store(Request $request, Internship $internship)
    {
        // Authorization checks: Only owner can store
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat menambah laporan untuk magang yang telah disetujui.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_file' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $filePath = $request->file('report_file')->store("internships/{$internship->id}/reports", 'public');

        $latestReport = $internship->reports()->latest('version')->first();
        $newVersion = $latestReport ? $latestReport->version + 1 : 1;

        // Create the report and assign it to $report variable
        $report = $internship->reports()->create([
            'user_id' => auth()->id(), // Belongs to the student
            'title' => $validated['title'],
            'report_file' => $filePath,
            'version' => $newVersion,
            'status' => 'pending',
        ]);

        // Notify the advisor (Dosen)
        $student = $internship->user->load('mahasiswaProfile.advisor'); // Load profile and advisor
        $advisor = $student->mahasiswaProfile?->advisor;
        if ($advisor) {
            $advisor->notify(new ReportSubmitted($report));
        }

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil ditambahkan.');
    }

    public function edit(Internship $internship, Report $report)
    {
        // Authorization checks: Only owner can edit
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Prevent editing approved reports
        if ($report->status === 'approved') {
            return redirect()->route('front.internships.reports.index', $internship)
                ->with('error', 'Laporan yang sudah disetujui tidak dapat diubah.');
        }

        return Inertia::render('front/internships/reports/edit', [
            'internship' => $internship,
            'report' => $report,
        ]);
    }

    public function update(UpdateReportRequest $request, Internship $internship, Report $report) // Change type hint
    {
        // Authorization checks: Only owner can update (Handled by UpdateReportRequest now)
        // if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
        //     abort(403, 'Unauthorized action.');
        // } // Correctly commented out block

        // Policy check and validation are handled by UpdateReportRequest

        // Get validated data from the form request
        $validated = $request->validated(); // Now correctly inside the method

        $updateData = [
            'title' => $validated['title'],
            'status' => 'pending', // Reset status to pending on update
        ];

        if ($request->hasFile('report_file')) {
            // Delete old file if it exists
            if ($report->report_file) {
                Storage::disk('public')->delete($report->report_file);
            }
            // Store new file and update version
            $updateData['report_file'] = $request->file('report_file')->store("internships/{$internship->id}/reports", 'public');
            $updateData['version'] = $report->version + 1;
        }

        $report->update($updateData);

        // Notify the advisor (Dosen) if the file was updated (implies resubmission)
        if (isset($updateData['report_file'])) {
            $student = $internship->user->load('mahasiswaProfile.advisor'); // Load profile and advisor
            $advisor = $student->mahasiswaProfile?->advisor;
            if ($advisor) {
                $advisor->notify(new ReportSubmitted($report));
            }
        }

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil diperbarui.');
    }

    public function destroy(Internship $internship, Report $report)
    {
        // Authorization checks: Only owner can delete
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403, 'Tindakan tidak sah.');
        }

        // Authorize using ReportPolicy
        $this->authorize('delete', $report);

        // Optionally, prevent deletion of approved reports (handled by policy now)
        // if ($report->status === 'approved') {
        //     return redirect()->route('front.internships.reports.index', $internship)
        //         ->with('error', 'Laporan yang sudah disetujui tidak dapat dihapus.');
        // }

        // Delete the associated file
        if ($report->report_file) {
            Storage::disk('public')->delete($report->report_file);
        }

        $report->delete();

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil dihapus.');
    }

    // Add download method with authorization
    public function downloadReportFile(Internship $internship, Report $report)
    {
        $user = Auth::user();
        $isOwner = $internship->user_id === $user->id && $report->user_id === $user->id;
        $isAdvisor = false;

        if ($user->hasRole('dosen')) {
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                $adviseeProfile = MahasiswaProfile::where('user_id', $internship->user_id)
                    ->where('advisor_id', $dosenProfile->user_id)
                    ->first();
                $isAdvisor = (bool) $adviseeProfile;
            }
        }

        // Authorize: Must be owner or advisor
        if (! $isOwner && ! $isAdvisor && ! $user->hasRole('admin')) { // Assuming admin can also download
            abort(403, 'Tindakan tidak sah.');
        }

        // Check if report belongs to the internship
        if ($report->internship_id !== $internship->id) {
            abort(404, 'Laporan tidak ditemukan untuk magang ini.');
        }

        // Check if file exists
        if (! $report->report_file || ! Storage::disk('public')->exists($report->report_file)) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($report->report_file);
    }

    // Method for Dosen/Admin to approve a report
    public function approve(Internship $internship, Report $report)
    {
        // Check if the report belongs to the internship first for a more specific error
        if ($report->internship_id !== $internship->id) {
            abort(404, 'Laporan tidak ditemukan untuk magang ini.');
        }

        // Authorize using ReportPolicy
        $this->authorize('approveOrReject', $report);

        // Check if the report is pending
        if ($report->status !== 'pending') {
            return back()->with('error', 'Hanya laporan yang berstatus pending yang dapat disetujui.');
        }

        // Update status to approved
        $report->update(['status' => 'approved']);

        // Notify the student
        $student = $report->user;
        if ($student) {
            $student->notify(new ReportStatusChanged($report, 'approved'));
        }

        return back()->with('success', 'Laporan berhasil disetujui.');
    }

    // Method for Dosen/Admin to reject a report
    public function reject(Request $request, Internship $internship, Report $report)
    {
        // Check if the report belongs to the internship first for a more specific error
        if ($report->internship_id !== $internship->id) {
            abort(404, 'Laporan tidak ditemukan untuk magang ini.');
        }

        // Authorize using ReportPolicy
        $this->authorize('approveOrReject', $report);

        // Check if the report is pending
        if ($report->status !== 'pending') {
            return back()->with('error', 'Hanya laporan yang berstatus pending yang dapat ditolak.');
        }

        // Validate rejection reason
        $validated = $request->validate([
            'rejection_note' => 'nullable|string|max:1000', // Validate the note
        ]);

        // Update status to rejected and add the note
        $updateData = [
            'status' => 'rejected',
            'reviewer_notes' => $validated['rejection_note'] ?? null, // Save note to reviewer_notes
        ];
        $report->update($updateData);

        // Notify the student (pass the note if needed by the notification)
        $student = $report->user;
        if ($student) {
            // You might need to modify the ReportStatusChanged notification
            // to accept and display the rejection note.
            $student->notify(new ReportStatusChanged($report, 'rejected', $updateData['reviewer_notes']));
        }

        return back()->with('success', 'Laporan berhasil ditolak dengan catatan.');
    }
}
