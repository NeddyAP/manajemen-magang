<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaqRequest;
use App\Http\Requests\UpdateFaqRequest;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Faq::query();

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('question', 'like', "%{$searchTerm}%")
                    ->orWhere('answer', 'like', "%{$searchTerm}%");
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
        $faqs = $query->paginate($perPage);

        return inertia('admin/faqs/index', [
            'faqs' => $faqs->items(),
            'meta' => [
                'total' => $faqs->total(),
                'per_page' => $faqs->perPage(),
                'current_page' => $faqs->currentPage(),
                'last_page' => $faqs->lastPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/faqs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFaqRequest $request)
    {
        try {
            Faq::create($request->validated());

            return redirect()->route('admin.faqs.index')->with('success', 'FAQ berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat FAQ: '.$e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Faq $faq)
    {
        return inertia('admin/faqs/edit', compact('faq'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFaqRequest $request, Faq $faq)
    {
        try {
            $faq->update($request->validated());

            return redirect()->route('admin.faqs.index')->with('success', 'FAQ berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui FAQ: '.$e->getMessage());
        }
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggle(Faq $faq)
    {
        try {
            $faq->update(['is_active' => ! $faq->is_active]);

            return redirect()->route('admin.faqs.index')->with('success', 'Status FAQ berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui status FAQ: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faq $faq)
    {
        try {
            $faq->delete();

            return redirect()->route('admin.faqs.index')->with('success', 'FAQ berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus FAQ: '.$e->getMessage());
        }
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy()
    {
        $ids = request()->input('ids');
        try {
            Faq::destroy($ids);

            return redirect()->route('admin.faqs.index')->with('success', 'FAQ berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus FAQ: '.$e->getMessage());
        }
    }
}
