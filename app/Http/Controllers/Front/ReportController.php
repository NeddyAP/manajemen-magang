<?php

namespace App\Http\Controllers\Front; // Corrected namespace

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\Report; // Use Report model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // For file handling

class ReportController extends Controller
{
    public function internList()
    {
        $internships = Internship::where('user_id', auth()->id())
            ->where('status', 'accepted')
            ->withCount('reports') // Count reports
            ->get();

        return inertia('front/internships/reports/intern-list', [ // Updated view path
            'internships' => $internships,
        ]);
    }

    public function index(Request $request, Internship $internship)
    {
        // Authorization checks
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat mengakses laporan untuk magang yang telah disetujui.');
        }

        $query = $internship->reports(); // Use reports relationship

        // Handle search (search by title)
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where('title', 'like', "%{$searchTerm}%");
        }

        // Handle status filter
        if ($request->has('status') && ! empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $reports = $query->paginate($perPage)->withQueryString();

        return inertia('front/internships/reports/index', [
            'internship' => $internship,
            'reports' => $reports->items(),
            'meta' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
        ]);
    }

    public function create(Internship $internship)
    {
        // Authorization checks
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat menambah laporan untuk magang yang telah disetujui.');
        }

        return inertia('front/internships/reports/create', [ // Updated view path
            'internship' => $internship,
        ]);
    }

    public function store(Request $request, Internship $internship)
    {
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Anda hanya dapat menambah laporan untuk magang yang telah disetujui.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_file' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $filePath = $request->file('report_file')->store("internships/{$internship->id}/reports", 'public');

        $latestReport = $internship->reports()->latest('version')->first();
        $newVersion = $latestReport ? $latestReport->version + 1 : 1;

        $internship->reports()->create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'report_file' => $filePath,
            'version' => $newVersion,
            'status' => 'pending',
        ]);

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil ditambahkan.');
    }

    public function edit(Internship $internship, Report $report)
    {
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403);
        }

        return inertia('front/internships/reports/edit', [
            'internship' => $internship,
            'report' => $report,
        ]);
    }

    public function update(Request $request, Internship $internship, Report $report)
    {
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403);
        }

        if ($report->status === 'approved') {
            return redirect()->route('front.internships.reports.index', $internship)
                ->with('error', 'Laporan yang sudah disetujui tidak dapat diubah.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'report_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'status' => 'pending',
        ];

        if ($request->hasFile('report_file')) {
            if ($report->report_file) {
                Storage::disk('public')->delete($report->report_file);
            }
            $updateData['report_file'] = $request->file('report_file')->store("internships/{$internship->id}/reports", 'public');
            $updateData['version'] = $report->version + 1;
        }

        $report->update($updateData);

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil diperbarui.');
    }

    public function destroy(Internship $internship, Report $report)
    {
        if ($internship->user_id !== auth()->id() || $report->internship_id !== $internship->id || $report->user_id !== auth()->id()) {
            abort(403);
        }

        if ($report->report_file) {
            Storage::disk('public')->delete($report->report_file);
        }

        $report->delete();

        return redirect()->route('front.internships.reports.index', $internship)
            ->with('success', 'Laporan berhasil dihapus.');
    }
}
