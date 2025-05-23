<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Http\Requests\UpdateInternshipRequest;
use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\User;
use App\Notifications\Internship\ApplicationSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternshipApplicantController extends Controller
{
    /**
     * Display a listing of applicant's internships.
     */
    public function index(Request $request)
    {
        // Check if user has permission to view internships
        $this->authorize('viewAny', Internship::class);

        $user = Auth::user();
        $query = Internship::query();

        if ($user->hasRole('dosen')) {
            // Dosen sees internships of their advisees
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                // Get user_ids of advisees
                $adviseeUserIds = MahasiswaProfile::where('advisor_id', $dosenProfile->user_id)
                    ->pluck('user_id')
                    ->toArray();
                $query->whereIn('user_id', $adviseeUserIds);
            } else {
                // Dosen has no profile, show nothing (or handle as needed)
                $query->whereRaw('1 = 0'); // No results
            }
        } elseif ($user->hasRole('mahasiswa')) {
            // Mahasiswa sees their own internships
            $query->where('user_id', $user->id);
        } else {
            // Other roles (e.g., admin might see all, or handle differently)
            // For now, let's assume they see nothing in this specific controller
            $query->whereRaw('1 = 0'); // No results for other roles in this context
        }

        // Clone the query for analytics *after* initial role-based filtering
        $analyticsQuery = clone $query;

        // Enhanced search functionality
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            $query->where(function ($q) use ($searchTerm): void {
                // Search in primary internship fields
                $q->where('company_name', 'like', "%{$searchTerm}%")
                    ->orWhere('company_address', 'like', "%{$searchTerm}%")
                    ->orWhere('type', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%");

                // Search by date ranges if the term looks like a date
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(start_date) = ? OR YEAR(end_date) = ?', [$searchTerm, $searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw('DATE_FORMAT(start_date, "%Y-%m") = ? OR DATE_FORMAT(end_date, "%Y-%m") = ?',
                            [$searchTerm, $searchTerm]);
                    }
                }

                // If user is dosen, also search by student name
                if (Auth::user()->hasRole('dosen')) {
                    $q->orWhereHas('user', function ($userQuery) use ($searchTerm): void {
                        $userQuery->where('name', 'like', "%{$searchTerm}%");
                    });

                    // Search by student number
                    $q->orWhereHas('user.mahasiswaProfile', function ($profileQuery) use ($searchTerm): void {
                        $profileQuery->where('student_number', 'like', "%{$searchTerm}%");
                    });
                }
            });
        }

        // Handle status filter with enhanced functionality
        if ($request->has('status') && ! empty($request->status)) {
            $status = $request->status;

            // Handle special combined status queries
            if ($status === 'not_waiting') {
                $query->whereNotIn('status', ['waiting']);
            } elseif ($status === 'completed') {
                $query->where('progress', 100);
            } elseif ($status === 'in_progress') {
                $query->where('status', 'accepted')
                    ->where('progress', '<', 100);
            } else {
                // Regular status filter
                $query->where('status', $status);
            }
        }

        // Handle type filter
        if ($request->has('type') && ! empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Advanced date range filtering
        if ($request->has('date_from') && ! empty($request->date_from)) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && ! empty($request->date_to)) {
            $query->where('end_date', '<=', $request->date_to);
        }

        // Handle sorting with advanced options
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $sortField = $request->sort_field;
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';

            // Special handling for related fields
            if ($sortField === 'student_name') {
                $query->join('users', 'internships.user_id', '=', 'users.id')
                    ->orderBy('users.name', $direction)
                    ->select('internships.*'); // To avoid field collision
            } elseif ($sortField === 'duration') {
                // Sort by internship duration
                $query->orderByRaw('DATEDIFF(end_date, start_date) '.$direction);
            } else {
                $query->orderBy($sortField, $direction);
            }
        } else {
            $query->latest('created_at');
        }

        // Eager load user and their profile relationship before pagination
        $query->with(['user:id,name', 'user.mahasiswaProfile:user_id,student_number']);

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $internshipsPagination = $query->paginate($perPage)->withQueryString();

        // Transform data to include mahasiswa_name and mahasiswa_nim
        $internships = $internshipsPagination->through(function ($internship) {
            $internship->mahasiswa_name = $internship->user?->name;
            $internship->mahasiswa_nim = $internship->user?->mahasiswaProfile?->student_number;

            // Optionally unset the loaded relationships if not needed directly in frontend JS
            // unset($internship->user);
            return $internship;
        });

        // Calculate analytics for the current user, removing any previous ordering
        $stats = $analyticsQuery
            ->reorder() // Remove existing order by clauses
            ->select(
                DB::raw('count(*) as total'),
                DB::raw("sum(case when status = 'waiting' then 1 else 0 end) as waiting"),
                DB::raw("sum(case when status = 'accepted' then 1 else 0 end) as accepted"),
                DB::raw("sum(case when status = 'rejected' then 1 else 0 end) as rejected")
            )
            ->first();

        return Inertia::render('front/internships/applicants/index', [
            'internships' => $internships->items(), // Use transformed items
            'stats' => $stats, // Pass stats to the view
            'isDosen' => $user->hasRole('dosen'), // Pass isDosen flag
            'meta' => [
                'total' => $internshipsPagination->total(), // Use original pagination meta
                'per_page' => $internshipsPagination->perPage(),
                'current_page' => $internshipsPagination->currentPage(),
                'last_page' => $internshipsPagination->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new internship application.
     */
    public function create()
    {
        // Check if user has permission to create internships
        $this->authorize('create', Internship::class);

        $user = Auth::user();
        $profile = MahasiswaProfile::where('user_id', $user->id)->first();
        $studentNumber = $profile ? $profile->student_number : null;

        return Inertia::render('front/internships/applicants/create', [
            'mahasiswa_profile' => ['student_number' => $studentNumber],
        ]);
    }

    /**
     * Store a newly created internship application.
     */
    public function store(StoreInternshipRequest $request)
    {
        // Check if user has permission to create internships
        $this->authorize('create', Internship::class);

        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('application_file')) {
            $path = $request->file('application_file')->store('internships/applications', 'public');
            $validated['application_file'] = $path;
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'waiting';
        $validated['progress'] = 0; // Changed to integer

        $internship = Internship::create($validated);

        // Notify Admins
        $admins = User::role('admin')->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new ApplicationSubmitted($internship));
        }

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Aplikasi magang berhasil diajukan!');
    }

    /**
     * Show the form for editing the specified internship application.
     */
    public function edit(Internship $internship)
    {
        // Check if user has permission to update this internship
        $this->authorize('update', $internship);

        $internship->loadMissing('user.mahasiswaProfile'); // Ensure relationships are loaded

        $studentNumber = null;
        if ($internship->user && $internship->user->mahasiswaProfile) {
            $studentNumber = $internship->user->mahasiswaProfile->student_number;
        }

        return Inertia::render('front/internships/applicants/edit', [
            'internship' => $internship, // Pass the full internship object
            'mahasiswa_profile' => ['student_number' => $studentNumber], // Pass the simplified profile data
        ]);
    }

    /**
     * Update the specified internship application.
     */
    public function update(UpdateInternshipRequest $request, Internship $internship)
    {
        // Check if user has permission to update this internship
        $this->authorize('update', $internship);

        // Only prevent updates if status is accepted
        if ($internship->status === 'accepted') {
            return redirect()->back()->with('error', 'Anda tidak dapat memperbarui aplikasi yang sudah diterima.');
        }

        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('application_file')) {
            // Delete old file if exists
            if ($internship->application_file) {
                Storage::disk('public')->delete($internship->application_file);
            }

            $path = $request->file('application_file')->store('internships/applications', 'public');
            $validated['application_file'] = $path;
        } else {
            // If no new file is uploaded, keep the existing file
            unset($validated['application_file']);
        }

        // Always set the status back to waiting on update
        $validated['status'] = 'waiting';

        $internship->update($validated);

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Aplikasi magang berhasil diperbarui!');
    }

    /**
     * Remove the specified internship application.
     */
    public function destroy(Internship $internship)
    {
        // Check if user has permission to delete this internship
        $this->authorize('delete', $internship);

        // Prevent deletion if status is accepted
        if ($internship->status === 'accepted') {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus aplikasi yang sudah diterima.');
        }

        // Delete application file if exists
        if ($internship->application_file) {
            Storage::disk('public')->delete($internship->application_file);
        }

        $internship->delete();

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Aplikasi magang berhasil dihapus!');
    }

    /**
     * Bulk delete internship applications.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $user = Auth::user();

        // Check if user has permission to delete internships
        if ($user->can('internships.delete')) {
            $query = Internship::whereIn('id', $validated['ids']);

            // If not admin, only allow deleting own waiting applications
            if (! $user->can('admin.dashboard.view')) {
                $query->where('user_id', $user->id)
                    ->where('status', 'waiting');
            }

            $internships = $query->get();

            foreach ($internships as $internship) {
                // Check if user can delete this specific internship
                if ($user->can('delete', $internship)) {
                    // Delete application file
                    if ($internship->application_file) {
                        Storage::disk('public')->delete($internship->application_file);
                    }
                    $internship->delete();
                }
            }

            return back()->with('success', 'Aplikasi magang yang dipilih berhasil dihapus!');
        } else {
            // User doesn't have permission to delete internships
            return back()->with('error', 'Anda tidak memiliki izin untuk menghapus aplikasi magang.');
        }
    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        // Check if user has permission to view this internship
        $this->authorize('view', $internship);

        if (! $internship->application_file || ! Storage::disk('public')->exists($internship->application_file)) {
            return back()->with('error', 'Berkas aplikasi tidak ditemukan.');
        }

        return Storage::disk('public')->download($internship->application_file);
    }
}
