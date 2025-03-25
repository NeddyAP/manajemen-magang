<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Http\Requests\UpdateInternshipRequest;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternshipController extends Controller
{
    /**
     * Display a listing of internships.
     */
    public function index()
    {
        return Inertia::render('front/internships/index');
    }

    /**
     * Display a listing of applicant's internships.
     */
    public function applicantsIndex(Request $request)
    {
        $query = Internship::query()->where('user_id', auth()->id());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('company_name', 'like', "%{$searchTerm}%")
                    ->orWhere('company_address', 'like', "%{$searchTerm}%")
                    ->orWhere('type', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%");
            });
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Handle type filter
        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $internships = $query->paginate($perPage);

        return Inertia::render('front/internships/applicants/index', [
            'internships' => $internships->items(),
            'meta' => [
                'total' => $internships->total(),
                'per_page' => $internships->perPage(),
                'current_page' => $internships->currentPage(),
                'last_page' => $internships->lastPage(),
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
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/applicants/show', [
            'internship' => $internship,
        ]);
    }

    /**
     * Show the form for editing the specified internship application.
     */
    public function edit(Internship $internship)
    {
        // Check if the internship belongs to the authenticated user
        if ($internship->user_id !== auth()->id()) {
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
            abort(403, 'Unauthorized action.');
        }

        // Only allow updates if status is waiting
        if ($internship->status !== 'waiting') {
            return redirect()->back()->with('error', 'You cannot update an application that has already been processed.');
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
        }

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
            abort(403, 'Unauthorized action.');
        }

        // Only allow deletion if status is waiting
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

        // Find the internships that belong to the user and have 'waiting' status
        $internships = Internship::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
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
    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        // Check if user is authorized (either owns the internship or is admin/lecturer)
        if ($internship->user_id !== auth()->id() && !auth()->user()->hasRole(['admin', 'dosen'])) {
            abort(403, 'Unauthorized action.');
        }

        if (!$internship->application_file) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($internship->application_file);
    }
}
