<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Logbook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogbookController extends Controller
{
    public function index(Request $request, Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if the internship is accepted
        if ($internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat mengakses logbook untuk magang yang telah disetujui.');
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
            'internship' => $internship,
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
        return Inertia::render('front/internships/logbooks/create', [
            'internship' => $internship,
        ]);
    }

    public function store(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'activities' => 'required|string',
        ]);

        $logbook = $internship->logbooks()->create($validated);

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil ditambahkan');
    }

    public function edit(Internship $internship, Logbook $logbook)
    {
        return Inertia::render('front/internships/logbooks/edit', [
            'internship' => $internship,
            'logbook' => $logbook,
        ]);
    }

    public function update(Request $request, Internship $internship, Logbook $logbook)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'activities' => 'required|string',
        ]);

        $logbook->update($validated);

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil diperbarui');
    }

    public function destroy(Internship $internship, Logbook $logbook)
    {
        $logbook->delete();

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil dihapus');
    }

    public function internList()
    {
        $internships = Internship::where('user_id', auth()->id())
            ->where('status', 'accepted')
            ->withCount('logbooks')
            ->get();

        return Inertia::render('front/internships/logbooks/intern-list', [
            'internships' => $internships,
        ]);
    }
}
