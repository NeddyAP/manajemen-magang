<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTutorialRequest;
use App\Http\Requests\UpdateTutorialRequest;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TutorialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Tutorial::query();

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "{$searchTerm}%")
                    ->orWhere('content', 'like', "{$searchTerm}%");
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
        $tutorials = $query->paginate($perPage);

        return inertia('admin/tutorials/index', [
            'tutorials' => $tutorials->items(),
            'meta' => [
                'total' => $tutorials->total(),
                'per_page' => $tutorials->perPage(),
                'current_page' => $tutorials->currentPage(),
                'last_page' => $tutorials->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/tutorials/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTutorialRequest $request)
    {
        try {
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('file_path')) {
                $file = $request->file('file_path');
                $fileName = time().'_'.$file->getClientOriginalName();

                // Store file in public directory to make it accessible
                $path = $file->storeAs('tutorials', $fileName, 'public');

                // Update data with the file path that can be accessed via Storage URL
                $data['file_path'] = $path;
            }

            $tutorial = Tutorial::create($data);

            return redirect()->route('admin.tutorials.index')->with('success', 'Tutorial berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat tutorial: '.$e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tutorial $tutorial)
    {
        try {
            return inertia('admin/tutorials/edit', [
                'tutorial' => $tutorial,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memuat tutorial: '.$e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTutorialRequest $request, Tutorial $tutorial)
    {
        try {
            $data = $request->validated();

            // Handle file upload if a new file is provided
            if ($request->hasFile('file_path')) {
                // Delete old file if exists
                if ($tutorial->file_path && Storage::disk('public')->exists($tutorial->file_path)) {
                    Storage::disk('public')->delete($tutorial->file_path);
                }

                $file = $request->file('file_path');
                $fileName = time().'_'.$file->getClientOriginalName();

                // Store file in public directory
                $path = $file->storeAs('tutorials', $fileName, 'public');

                // Update data with the file path
                $data['file_path'] = $path;
            } else {
                // If no new file is uploaded, keep the existing file
                unset($data['file_path']);
            }

            $tutorial->update($data);

            return redirect()->route('admin.tutorials.index')->with('success', 'Tutorial berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui tutorial: '.$e->getMessage());
        }
    }

    /**
     * Toggle is_active.
     */
    public function toggle(Tutorial $tutorial)
    {
        try {
            $tutorial->update(['is_active' => ! $tutorial->is_active]);

            return redirect()->back()->with('success', 'Status tutorial berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui status tutorial: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tutorial $tutorial)
    {
        try {
            // Delete the file if it exists
            if ($tutorial->file_path && Storage::disk('public')->exists($tutorial->file_path)) {
                Storage::disk('public')->delete($tutorial->file_path);
            }

            $tutorial->delete();

            return redirect()->route('admin.tutorials.index')->with('success', 'Tutorial berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus tutorial: '.$e->getMessage());
        }
    }

    /**
     * Bulk destroy tutorials.
     */
    public function bulkDestroy(Request $request)
    {
        try {
            $ids = $request->input('ids');
            $tutorials = Tutorial::whereIn('id', $ids)->get();

            // Delete files for each tutorial
            foreach ($tutorials as $tutorial) {
                if ($tutorial->file_path && Storage::disk('public')->exists($tutorial->file_path)) {
                    Storage::disk('public')->delete($tutorial->file_path);
                }
            }

            Tutorial::whereIn('id', $ids)->delete();

            return redirect()->route('admin.tutorials.index')->with('success', 'Tutorial berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus tutorial: '.$e->getMessage());
        }
    }
}
