<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InternshipStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Notifications\Internship\ApplicationStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InternshipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Internship::with([
            'user.mahasiswaProfile.advisor',
            'user.mahasiswaProfile.advisor.dosenProfile',
        ]);

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('company_name', 'LIKE', "%{$searchTerm}%")
                ->orWhere('company_address', 'LIKE', "%{$searchTerm}%")
                ->orWhereHas('user', function ($query) use ($searchTerm): void {
                    $query->where('name', 'LIKE', "%{$searchTerm}%");
                });
        }

        // Handle explicit status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status); // Keep as is if request sends string value
        }

        // Handle explicit type filter
        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type); // Keep as is if request sends string value
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
     * Show the form for editing the specified resource.
     */
    public function edit(Internship $internship)
    {

        return Inertia::render('admin/internships/edit', [
            'internship' => $internship->load([
                'user.mahasiswaProfile.advisor',
                'user.mahasiswaProfile.advisor.dosenProfile',
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(InternshipStatusEnum::class)],
            'status_message' => ['required_if:status,'.InternshipStatusEnum::REJECTED->value, 'nullable', 'string'],
        ]);

        $internship->update($validated);

        // Notify the student
        $internship->user->notify(new ApplicationStatusChanged($internship));

        return redirect()->route('admin.internships.index')
            ->with('success', 'Magang berhasil diubah!');
    }

    /**
     * Update the status of the specified internship.
     */
    public function updateStatus(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(InternshipStatusEnum::class)],
            'advisor_id' => ['required_if:status,'.InternshipStatusEnum::ACCEPTED->value, 'nullable', 'exists:users,id'],
        ]);

        // Update the advisor_id in the MahasiswaProfile instead of lecturer_id in Internship
        if (isset($validated['advisor_id']) && $internship->user->mahasiswaProfile) {
            $internship->user->mahasiswaProfile->update([
                'advisor_id' => $validated['advisor_id'],
            ]);
            unset($validated['advisor_id']);
        }

        $internship->update($validated);

        // Notify the student
        $internship->user->notify(new ApplicationStatusChanged($internship));

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
            ->with('success', 'Data magang berhasil dihapus!');
    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        if (! $internship->application_file) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($internship->application_file);
    }
}
