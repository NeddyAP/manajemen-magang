<?php

namespace App\Http\Controllers\Front; // Corrected namespace

use App\Http\Controllers\Controller;
use App\Models\DosenProfile; // Add DosenProfile
use App\Models\Internship;
use App\Models\MahasiswaProfile; // Add MahasiswaProfile
use App\Models\Report; // Use Report model
use App\Models\User; // Add User
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Add Auth
use Illuminate\Support\Facades\DB; // Add DB facade
use Illuminate\Support\Facades\Storage; // For file handling
use Inertia\Inertia; // Add Inertia

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

        $internship->reports()->create([
            'user_id' => auth()->id(), // Belongs to the student
            'title' => $validated['title'],
            'report_file' => $filePath,
            'version' => $newVersion,
            'status' => 'pending',
        ]);

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

    public function update(Request $request, Internship $internship, Report $report)
    {
        // Authorization checks: Only owner can update
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Prevent updating approved reports
        if ($report->status === 'approved') {
            return redirect()->route('front.internships.reports.index', $internship)
                ->with('error', 'Laporan yang sudah disetujui tidak dapat diubah.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

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

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil diperbarui.');
    }

    public function destroy(Internship $internship, Report $report)
    {
        // Authorization checks: Only owner can delete
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Optionally, prevent deletion of approved reports
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
            abort(403, 'Unauthorized action.');
        }

        // Check if report belongs to the internship
        if ($report->internship_id !== $internship->id) {
            abort(404, 'Report not found for this internship.');
        }

        // Check if file exists
        if (! $report->report_file || ! Storage::disk('public')->exists($report->report_file)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($report->report_file);
    }
}
