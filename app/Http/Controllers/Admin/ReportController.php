<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Report::with([
            'user',
            'internship',
        ]);

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('title', 'LIKE', "%{$searchTerm}%")
                ->orWhereHas('user', function ($query) use ($searchTerm) {
                    $query->where('name', 'LIKE', "%{$searchTerm}%");
                })
                ->orWhereHas('internship', function ($query) use ($searchTerm) {
                    $query->where('company_name', 'LIKE', "%{$searchTerm}%");
                });
        }

        // Handle status filter
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
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
        $reports = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/reports/index', [
            'reports' => $reports->items(),
            'meta' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function edit(Report $report)
    {
        return Inertia::render('admin/reports/edit', [
            'report' => $report->load([
                'user',
                'internship',
            ]),
        ]);
    }

    /**
     * Update the status of the specified report.
     */
    public function update(Request $request, Report $report)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'reviewer_notes' => 'required_if:status,rejected',
        ]);

        $report->update($validated);

        return redirect()->back()->with('success', 'Status laporan berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report)
    {
        // Delete report file if exists
        if ($report->report_file) {
            Storage::disk('public')->delete($report->report_file);
        }

        $report->delete();

        return redirect()->route('admin.reports.index')
            ->with('success', 'Data laporan berhasil dihapus!');
    }
}
