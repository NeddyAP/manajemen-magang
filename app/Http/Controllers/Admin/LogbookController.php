<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Logbook::with([
            'internship.user',
            'internship.user.mahasiswaProfile',
        ]);

        // Handle search with more comprehensive capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            $query->where(function ($q) use ($searchTerm): void {
                // Search in logbook content
                $q->where('date', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('activities', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('supervisor_notes', 'LIKE', "%{$searchTerm}%");

                // Search in related user data
                $q->orWhereHas('internship.user', function ($userQuery) use ($searchTerm): void {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });

                // Search in related internship data for company name
                $q->orWhereHas('internship', function ($internshipQuery) use ($searchTerm): void {
                    $internshipQuery->where('company_name', 'LIKE', "%{$searchTerm}%");
                });

                // Search by date if the search term is a valid date format
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(date) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$searchTerm]);
                    }
                }
            });
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
                $query->join('internships', 'logbooks.internship_id', '=', 'internships.id')
                    ->join('users', 'internships.user_id', '=', 'users.id')
                    ->orderBy('users.name', $direction)
                    ->select('logbooks.*');
            } else {
                $query->orderBy($sortField, $direction);
            }
        } else {
            $query->latest('created_at');
        }

        // Paginate the results
        $perPage = $request->input('per_page', 10);
        $logbooks = $query->paginate($perPage)->withQueryString();

        // Get unique mahasiswas for the filter
        $mahasiswas = User::whereHas('internships.logbooks')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return inertia('admin/logbooks/index', [
            'logbooks' => $logbooks->items(),
            'mahasiswas' => $mahasiswas,
            'meta' => [
                'total' => $logbooks->total(),
                'per_page' => $logbooks->perPage(),
                'current_page' => $logbooks->currentPage(),
                'last_page' => $logbooks->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function show(Logbook $logbook)
    {
        $logbook->load([
            'internship.user',
            'internship.user.mahasiswaProfile',
            'internship.user.mahasiswaProfile.advisor',
        ]);

        return inertia('admin/logbooks/show', ['logbook' => $logbook]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Logbook $logbook)
    {
        try {
            $logbook->delete();

            return redirect()->route('admin.logbooks.index')->with('success', 'Logbook berhasil dihapus.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus logbook: '.$e->getMessage());
        }
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:logbooks,id',
        ]);

        try {
            Logbook::whereIn('id', $validated['ids'])->delete();

            return redirect()->route('admin.logbooks.index')->with('success', 'Logbook berhasil dihapus.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus logbook: '.$e->getMessage());
        }
    }
}
