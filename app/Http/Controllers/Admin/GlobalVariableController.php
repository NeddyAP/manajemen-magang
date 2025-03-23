<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGlobalVariableRequest;
use App\Http\Requests\UpdateGlobalVariableRequest;
use App\Models\GlobalVariable;
use Illuminate\Http\Request;

class GlobalVariableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = GlobalVariable::query();

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('key', 'like', "%{$searchTerm}%")
                    ->orWhere('value', 'like', "%{$searchTerm}%");
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
        $globalVariables = $query->paginate($perPage);

        return inertia('admin/global-variables/index', [
            'globalVariables' => $globalVariables->items(),
            'meta' => [
                'total' => $globalVariables->total(),
                'per_page' => $globalVariables->perPage(),
                'current_page' => $globalVariables->currentPage(),
                'last_page' => $globalVariables->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/global-variables/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGlobalVariableRequest $request)
    {
        try {
            GlobalVariable::create($request->validated());

            return redirect()->route('admin.global-variables.index')->with('success', 'Variabel Global berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat Variabel Global: '.$e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GlobalVariable $globalVariable)
    {
        return inertia('admin/global-variables/edit', compact('globalVariable'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGlobalVariableRequest $request, GlobalVariable $globalVariable)
    {
        try {
            $globalVariable->update($request->validated());

            return redirect()->route('admin.global-variables.index')->with('success', 'Variabel Global berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui Variabel Global: '.$e->getMessage());
        }
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggle(GlobalVariable $globalVariable)
    {
        try {
            $globalVariable->update(['is_active' => ! $globalVariable->is_active]);

            return redirect()->route('admin.global-variables.index')->with('success', 'Status Variabel Global berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui status Variabel Global: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GlobalVariable $globalVariable)
    {
        try {
            $globalVariable->delete();

            return redirect()->route('admin.global-variables.index')->with('success', 'Variabel Global berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus Variabel Global: '.$e->getMessage());
        }
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy()
    {
        $ids = request()->input('ids');
        try {
            GlobalVariable::destroy($ids);

            return redirect()->route('admin.global-variables.index')->with('success', 'Variabel Global berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus Variabel Global: '.$e->getMessage());
        }
    }
}
