<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Http\Requests\UpdateInternshipRequest;
use App\Models\DosenProfile; // Add DosenProfile model
use App\Models\Internship;
use App\Models\MahasiswaProfile; // Add MahasiswaProfile model
use App\Models\User; // Add User model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Add Auth facade
use Illuminate\Support\Facades\DB; // Add DB facade
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternshipApplicantController extends Controller
{
    /**
     * Display a listing of applicant's internships.
     */
    public function index(Request $request)
    {
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

        // Handle search
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('company_name', 'like', "%{$searchTerm}%")
                    ->orWhere('company_address', 'like', "%{$searchTerm}%")
                    ->orWhere('type', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%");
            });
        }

        // Handle status filter
        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Handle type filter
        if ($request->has('type') && ! empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Handle sorting
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Eager load user and their profile relationship before pagination
        $query->with(['user:id,name', 'user.mahasiswaProfile:user_id,student_number']);

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $internshipsPagination = $query->paginate($perPage);

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
        return Inertia::render('front/internships/applicants/create');
    }

    /**
     * Store a newly created internship application.
     */
    public function store(StoreInternshipRequest $request)
    {
        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('application_file')) {
            $path = $request->file('application_file')->store('internship_applications', 'public');
            $validated['application_file'] = $path;
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'waiting';
        $validated['progress'] = '0';

        Internship::create($validated);

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Internship application submitted successfully!');
    }

    /**
     * Display the specified internship application.
     */
    public function show(Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
            // Allow Dosen to view advisee's internship
            $isAdvisee = false;
            if (auth()->user()->hasRole('dosen')) {
                $dosenProfile = DosenProfile::where('user_id', auth()->id())->first();
                if ($dosenProfile) {
                    $adviseeProfile = MahasiswaProfile::where('user_id', $internship->user_id)
                        ->where('advisor_id', $dosenProfile->user_id)
                        ->first();
                    $isAdvisee = (bool) $adviseeProfile;
                }
            }
            if (! $isAdvisee) {
                abort(403, 'Unauthorized action.');
            }
        }

        return Inertia::render('front/internships/applicants/show', [
            'internship' => $internship->load('user.mahasiswaProfile'), // Eager load user and profile
        ]);
    }

    /**
     * Show the form for editing the specified internship application.
     */
    public function edit(Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
            // Dosen cannot edit student applications directly through this interface
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/applicants/edit', [
            'internship' => $internship,
        ]);
    }

    /**
     * Update the specified internship application.
     */
    public function update(UpdateInternshipRequest $request, Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
            // Dosen cannot update student applications directly through this interface
            abort(403, 'Unauthorized action.');
        }

        // Only prevent updates if status is accepted (for mahasiswa)
        if ($internship->status === 'accepted') {
            return redirect()->back()->with('error', 'You cannot update an application that has already been accepted.');
        }

        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('application_file')) {
            // Delete old file if exists
            if ($internship->application_file) {
                Storage::disk('public')->delete($internship->application_file);
            }

            $path = $request->file('application_file')->store('internship_applications', 'public');
            $validated['application_file'] = $path;
        } else {
            // If no new file is uploaded, keep the existing file
            unset($validated['application_file']);
        }

        // Always set the status back to waiting on update
        $validated['status'] = 'waiting';

        $internship->update($validated);

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Internship application updated successfully!');
    }

    /**
     * Remove the specified internship application.
     */
    public function destroy(Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
            // Dosen cannot delete student applications directly through this interface
            abort(403, 'Unauthorized action.');
        }

        // Only allow deletion if status is waiting (for mahasiswa)
        if ($internship->status !== 'waiting') {
            return redirect()->back()->with('error', 'You cannot delete an application that has already been processed.');
        }

        // Delete application file
        if ($internship->application_file) {
            Storage::disk('public')->delete($internship->application_file);
        }

        $internship->delete();

        return redirect()->route('front.internships.applicants.index')
            ->with('success', 'Internship application deleted successfully!');
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

        // Mahasiswa can only bulk delete their own 'waiting' applications
        if ($user->hasRole('mahasiswa')) {
            $internships = Internship::whereIn('id', $validated['ids'])
                ->where('user_id', $user->id)
                ->where('status', 'waiting')
                ->get();

            foreach ($internships as $internship) {
                // Delete application file
                if ($internship->application_file) {
                    Storage::disk('public')->delete($internship->application_file);
                }
                $internship->delete();
            }

            return back()->with('success', 'Selected internship applications deleted successfully!');
        } else {
            // Dosen or other roles cannot bulk delete via this method
            return back()->with('error', 'Unauthorized action for bulk deletion.');
        }

    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        $user = Auth::user();

        // Check if user is authorized (owns the internship or is the advisor Dosen)
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

        if (! $isOwner && ! $isAdvisor && ! $user->hasRole('admin')) { // Assuming admin can also download
            abort(403, 'Unauthorized action.');
        }

        if (! $internship->application_file) {
            // Delete application file
            if ($internship->application_file) {
                Storage::disk('public')->delete($internship->application_file);
            }

            $internship->delete();
        }

        return back()->with('success', 'Selected internship applications deleted successfully!');
    }
}
