<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLogbookRequest;
use App\Http\Requests\UpdateLogbookRequest;
use App\Models\Logbook;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Logbook::with([
            'internship.user.mahasiswaProfile.advisor.dosenProfile',
            'internship.user.mahasiswaProfile.prodi',
            'internship.user.mahasiswaProfile.fakultas',
        ]);

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('activities', 'like', "%{$searchTerm}%")
                    ->orWhere('supervisor_notes', 'like', "%{$searchTerm}%")
                    ->orWhereHas('internship.user', function ($query) use ($searchTerm) {
                        $query->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Handle filters
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
        $logbooks = $query->paginate($perPage)->withQueryString();

        return inertia('admin/logbooks/index', [
            'logbooks' => $logbooks->items(),
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
            'internship.user.mahasiswaProfile.advisor.dosenProfile',
            'internship.user.mahasiswaProfile',
        ]);

        return inertia('admin/logbooks/show', compact('logbook'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Logbook $logbook)
    {
        try {
            $logbook->delete();

            return redirect()->route('admin.logbooks.index')->with('success', 'Logbook berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus Logbook: ' . $e->getMessage());
        }
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy()
    {
        $ids = request()->input('ids');
        try {
            Logbook::destroy($ids);

            return redirect()->route('admin.logbooks.index')->with('success', 'Logbook berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus Logbook: ' . $e->getMessage());
        }
    }
}
