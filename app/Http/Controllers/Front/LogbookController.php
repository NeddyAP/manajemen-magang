<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLogbookRequest; // Import StoreLogbookRequest
use App\Http\Requests\UpdateLogbookRequest; // Import UpdateLogbookRequest
use App\Models\DosenProfile; // Add DosenProfile
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\MahasiswaProfile;
use App\Models\User;
use App\Notifications\Logbook\EntrySubmitted; // Import Notification
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LogbookController extends Controller
{
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

        // Authorize: Must be owner or advisor, and internship must be accepted
        if ((! $isOwner && ! $isAdvisor) || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized access or internship not accepted.');
        }

        $query = $internship->logbooks();

        // Handle search
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('activities', 'like', "%{$searchTerm}%")
                    ->orWhere('date', 'like', "%{$searchTerm}%");
            });
        }

        // Handle sorting
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Get total count before pagination/filtering for analytics
        $totalLogbookCount = $internship->logbooks()->count();

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $logbooks = $query->paginate($perPage)->withQueryString();

        return Inertia::render('front/internships/logbooks/index', [
            'internship' => $internship->load('user:id,name'), // Load user for context
            'logbooks' => $logbooks->items(),
            'totalLogbookCount' => $totalLogbookCount, // Pass total count
            'meta' => [
                'total' => $logbooks->total(),
                'per_page' => $logbooks->perPage(),
                'current_page' => $logbooks->currentPage(),
                'last_page' => $logbooks->lastPage(),
            ],
        ]);
    }

    public function create(Internship $internship)
    {
        // Only owner can create
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/logbooks/create', [
            'internship' => $internship,
        ]);
    }

    public function store(StoreLogbookRequest $request, Internship $internship) // Use StoreLogbookRequest
    {
        // Authorization is handled by StoreLogbookRequest and this check
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized action or internship not accepted.');
        }

        $validated = $request->validated();

        // Associate logbook with the internship owner (student)
        $validated['user_id'] = $internship->user_id;

        $logbook = $internship->logbooks()->create($validated);

        // Notify the advisor (Dosen)
        $student = $internship->user->load('mahasiswaProfile.advisor'); // Load profile and advisor
        $advisor = $student->mahasiswaProfile?->advisor;

        if ($advisor) {
            $advisor->notify(new EntrySubmitted($logbook));
        }

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil ditambahkan');
    }

    public function edit(Internship $internship, Logbook $logbook)
    {
        // owner and advisor can edit
        if ((! auth()->user()->hasRole('dosen') && $internship->user_id !== auth()->id()) || $logbook->internship_id !== $internship->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/logbooks/edit', [
            'internship' => $internship,
            'logbook' => $logbook,
        ]);
    }

    public function update(UpdateLogbookRequest $request, Internship $internship, Logbook $logbook) // Use UpdateLogbookRequest
    {
        // Authorization is handled by UpdateLogbookRequest and this check
        if ($logbook->internship_id !== $internship->id) { // Ensure logbook belongs to the internship
            abort(404); // Or 403, depending on desired behavior
        }
        // Additional check if Dosen is trying to update notes vs student updating their entry
        if (auth()->user()->hasRole('dosen')) {
            $validated['supervisor_notes'] = $request->input('supervisor_notes');
        }

        $validated = $request->validated();

        // If a Dosen is updating, they might only be allowed to update supervisor_notes

        $logbook->update($validated);

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil diperbarui');
    }

    public function destroy(Internship $internship, Logbook $logbook)
    {
        // Ensure logbook belongs to the internship (route model binding should mostly handle this)
        if ($logbook->internship_id !== $internship->id) {
            abort(404); // Or 403
        }

        $this->authorize('delete', $logbook); // Use the policy for authorization

        $logbook->delete(); // This will perform a soft delete

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil dihapus');
    }

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

        // Eager load user details and count logbooks
        $internships = $query->with(['user:id,name']) // Load user name
            ->withCount('logbooks') // Count related logbooks
            ->get();

        return Inertia::render('front/internships/logbooks/intern-list', [
            'internships' => $internships, // This will now include 'logbooks_count' attribute
            'filters' => ['search' => $search], // Pass search term back to view
        ]);
    }
}
