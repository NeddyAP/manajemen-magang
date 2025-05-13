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

        // Handle search with more comprehensive capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            // Use a more efficient search with a cleaner approach
            $query->where(function ($q) use ($searchTerm): void {
                // Search in internship fields
                $q->where('company_name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('company_address', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('type', 'LIKE', "%{$searchTerm}%");

                // Search in related user data
                $q->orWhereHas('user', function ($userQuery) use ($searchTerm): void {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });

                // Include advisor search
                $q->orWhereHas('user.mahasiswaProfile.advisor', function ($advisorQuery) use ($searchTerm): void {
                    $advisorQuery->where('name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });

                // Search by progress percentage if the search term is numeric
                if (is_numeric($searchTerm)) {
                    $q->orWhere('progress', '=', (int) $searchTerm);
                }

                // Search by month/year in dates
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(start_date) = ?', [$searchTerm])
                            ->orWhereRaw('YEAR(end_date) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(start_date, '%Y-%m') = ?", [$searchTerm])
                            ->orWhereRaw("DATE_FORMAT(end_date, '%Y-%m') = ?", [$searchTerm]);
                    }
                }
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
                if (! empty($value)) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        // Handle sorting with advanced options
        if ($request->has('sort_field')) {
            $sortField = $request->sort_field;
            $direction = $request->input('sort_direction', 'asc');

            // Special handling for related fields
            if ($sortField === 'user') {
                $query->join('users', 'internships.user_id', '=', 'users.id')
                    ->orderBy('users.name', $direction)
                    ->select('internships.*');
            } elseif ($sortField === 'lecturer') {
                $query->join('users as students', 'internships.user_id', '=', 'students.id')
                    ->join('mahasiswa_profiles', 'students.id', '=', 'mahasiswa_profiles.user_id')
                    ->join('users as advisors', 'mahasiswa_profiles.advisor_id', '=', 'advisors.id')
                    ->orderBy('advisors.name', $direction)
                    ->select('internships.*');
            } else {
                $query->orderBy($sortField, $direction);
            }
        } else {
            $query->latest('updated_at');
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
     * Bulk destroy the specified resources.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:internships,id',
        ]);

        // Get internships with files
        $internships = Internship::whereIn('id', $validated['ids'])->get();

        // Delete application files if they exist
        foreach ($internships as $internship) {
            if ($internship->application_file) {
                Storage::disk('public')->delete($internship->application_file);
            }
        }

        // Delete all in a single query for efficiency
        Internship::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('admin.internships.index')
            ->with('success', 'Data magang berhasil dihapus!');
    }

    /**
     * Download the application file.
     */
    public function downloadApplicationFile(Internship $internship)
    {
        abort_unless($internship->application_file, 404, 'Berkas tidak ditemukan.');

        return Storage::disk('public')->download($internship->application_file);
    }
}
