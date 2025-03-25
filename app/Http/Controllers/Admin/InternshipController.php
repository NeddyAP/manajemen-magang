<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInternshipRequest;
use App\Http\Requests\UpdateInternshipRequest;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InternshipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Internship::with(['user.mahasiswaProfile.advisor']);

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('company_name', 'LIKE', "%{$searchTerm}%")
                ->orWhere('company_address', 'LIKE', "%{$searchTerm}%")
                ->orWhereHas('user', function ($query) use ($searchTerm) {
                    $query->where('name', 'LIKE', "%{$searchTerm}%");
                });
        }

        // Handle explicit status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Handle explicit type filter
        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        // Handle general filters
        if ($request->has('filter')) {
            foreach ($request->filter as $column => $value) {
                $query->where($column, 'like', "%{$value}%");
            }
        }

        // Handle sorting
        if ($request->has('sort_field')) {
            $direction = $request->input('sort_direction', 'asc');
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Paginate the results
        $perPage = $request->input('per_page', 10);
        $internships = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/internships/index', [
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $students = User::where('role', 'mahasiswa')->get();
        $lecturers = User::where('role', 'dosen')->get();

        return Inertia::render('admin/internships/create', [
            'students' => $students,
            'lecturers' => $lecturers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInternshipRequest $request)
    {
        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('application_file')) {
            $path = $request->file('application_file')->store('internship_applications', 'public');
            $validated['application_file'] = $path;
        }

        Internship::create($validated);

        return redirect()->route('admin.internships.index')
            ->with('success', 'Magang berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Internship $internship)
    {
        $internship->load(['user.mahasiswaProfile.advisor', 'logbooks', 'reports']);

        // Assign the advisor as lecturer for frontend compatibility
        $internship->lecturer = $internship->user->mahasiswaProfile->advisor ?? null;

        return Inertia::render('admin/internships/show', [
            'internship' => $internship,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Internship $internship)
    {
        $students = User::where('role', 'mahasiswa')->get();
        $lecturers = User::where('role', 'dosen')->get();

        return Inertia::render('admin/internships/edit', [
            'internship' => $internship,
            'students' => $students,
            'lecturers' => $lecturers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Internship $internship)
    {
        // Validate the request
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'lecturer_id' => 'sometimes|nullable|exists:users,id',
            'type' => 'sometimes|required|in:kkl,kkn',
            'company_name' => 'sometimes|required|string|max:255',
            'company_address' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'status' => 'sometimes|required|in:waiting,accepted,rejected',
            'progress' => 'sometimes|required|numeric|min:0|max:100',
            'application_file' => 'sometimes|nullable|file|mimes:pdf|max:2048',
        ]);

        // Handle file upload if provided
        if ($request->hasFile('application_file')) {
            // Delete old file if exists
            if ($internship->application_file) {
                Storage::disk('public')->delete($internship->application_file);
            }

            $path = $request->file('application_file')->store('internship_applications', 'public');
            $validated['application_file'] = $path;
        }

        $internship->update($validated);

        return redirect()->route('admin.internships.index')
            ->with('success', 'Magang berhasil diubah!');
    }

    /**
     * Update the status of the specified internship.
     */
    public function updateStatus(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,accepted,rejected',
            'advisor_id' => 'required_if:status,accepted|nullable|exists:users,id',
        ]);

        // Update the advisor_id in the MahasiswaProfile instead of lecturer_id in Internship
        if (isset($validated['advisor_id']) && $internship->user->mahasiswaProfile) {
            $internship->user->mahasiswaProfile->update([
                'advisor_id' => $validated['advisor_id']
            ]);
            unset($validated['advisor_id']);
        }

        $internship->update($validated);

        return redirect()->back()->with('success', 'Status magang berhasil diperbarui!');
    }

    /**
     * Update the progress of the specified internship.
     */
    public function updateProgress(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'progress' => 'required|numeric|min:0|max:100',
        ]);

        $internship->update($validated);

        return redirect()->back()->with('success', 'Kemajuan magang berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Internship $internship)
    {
        // Delete application file if exists
        if ($internship->application_file) {
            Storage::disk('public')->delete($internship->application_file);
        }

        $internship->delete();

        return redirect()->route('admin.internships.index')
            ->with('success', 'Magang berhasil dihapus!');
    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        if (!$internship->application_file) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($internship->application_file);
    }
}
