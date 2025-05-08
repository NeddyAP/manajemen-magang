<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
            'internship.user',
            'internship.user.mahasiswaProfile',
        ]);

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->whereHas('internship.user', function ($q) use ($searchTerm) {
                $q->where('name', 'like', "{$searchTerm}%")
                    ->orWhere('email', 'like', "{$searchTerm}%");
            });
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

        // Get unique mahasiswas for the filter
        $mahasiswas = \App\Models\User::whereHas('internships.logbooks')
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
            return redirect()->back()->with('error', 'Gagal menghapus logbook: '.$e->getMessage());
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
            return redirect()->back()->with('error', 'Gagal menghapus logbook: '.$e->getMessage());
        }
    }
}
