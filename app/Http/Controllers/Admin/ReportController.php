<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Notifications\Reports\ReportStatusChanged;
use Carbon\Carbon;
use DB;
use Exception;
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

        // Handle search with advanced capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            $query->where(function ($q) use ($searchTerm): void {
                // Search in report content
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('status', 'like', "%{$searchTerm}%")
                    ->orWhere('reviewer_notes', 'like', "%{$searchTerm}%");

                // Search in related user data
                $q->orWhereHas('user', function ($userQuery) use ($searchTerm): void {
                    $userQuery->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%")
                        ->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($searchTerm): void {
                            $profileQuery->where('student_number', 'like', "%{$searchTerm}%")
                                ->orWhere('study_program', 'like', "%{$searchTerm}%");
                        });
                });

                // Search in related internship data
                $q->orWhereHas('internship', function ($internshipQuery) use ($searchTerm): void {
                    $internshipQuery->where('company_name', 'like', "%{$searchTerm}%")
                        ->orWhere('company_address', 'like', "%{$searchTerm}%");
                });

                // Search by version if numeric
                if (is_numeric($searchTerm)) {
                    $q->orWhere('version', '=', $searchTerm);
                }

                // Search by date with multiple format support
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(created_at) = ?', [$searchTerm])
                            ->orWhereRaw('YEAR(updated_at) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$searchTerm])
                            ->orWhereRaw("DATE_FORMAT(updated_at, '%Y-%m') = ?", [$searchTerm]);
                    }
                }

                // Try to parse as a date string and search
                try {
                    $date = Carbon::parse($searchTerm);
                    $formattedDate = $date->format('Y-m-d');
                    $q->orWhereDate('created_at', $formattedDate)
                        ->orWhereDate('updated_at', $formattedDate);
                } catch (Exception $e) {
                    // Not a valid date format, skip this search condition
                }
            });
        }

        // Handle comprehensive filtering
        if ($request->has('filter')) {
            foreach ($request->filter as $column => $value) {
                if (! empty($value)) {
                    if ($column === 'status') {
                        // Filter by status
                        $query->where('status', $value);
                    } elseif ($column === 'student') {
                        // Filter by student ID
                        $query->where('user_id', $value);
                    } elseif ($column === 'internship') {
                        // Filter by internship ID
                        $query->where('internship_id', $value);
                    } elseif ($column === 'date_range') {
                        // Handle date range filtering
                        $dates = explode(',', $value);
                        if (count($dates) === 2) {
                            if (! empty($dates[0])) {
                                $query->whereDate('created_at', '>=', $dates[0]);
                            }
                            if (! empty($dates[1])) {
                                $query->whereDate('created_at', '<=', $dates[1]);
                            }
                        }
                    } else {
                        // Generic column filtering
                        $query->where($column, 'like', "%{$value}%");
                    }
                }
            }
        } elseif ($request->has('status') && $request->status !== '') {
            // Direct status parameter support
            $query->where('status', $request->status);
        }

        // Handle advanced sorting
        if ($request->has('sort_field')) {
            $sortField = $request->sort_field;
            $direction = $request->input('sort_direction', 'asc');

            // Special handling for related fields
            if ($sortField === 'student_name') {
                $query->join('users', 'reports.user_id', '=', 'users.id')
                    ->orderBy('users.name', $direction)
                    ->select('reports.*');
            } elseif ($sortField === 'company_name') {
                $query->join('internships', 'reports.internship_id', '=', 'internships.id')
                    ->orderBy('internships.company_name', $direction)
                    ->select('reports.*');
            } else {
                $sortMapping = [
                    'title' => 'title',
                    'status' => 'status',
                    'version' => 'version',
                    'created_at' => 'created_at',
                    'updated_at' => 'updated_at',
                ];

                if (isset($sortMapping[$sortField])) {
                    $query->orderBy($sortMapping[$sortField], $direction);
                } else {
                    $query->latest();
                }
            }
        } else {
            $query->latest();
        }

        // Get analytics data
        $reportStats = Report::select(
            DB::raw('count(*) as total'),
            DB::raw("sum(case when status = 'pending' then 1 else 0 end) as pending"),
            DB::raw("sum(case when status = 'approved' then 1 else 0 end) as approved"),
            DB::raw("sum(case when status = 'rejected' then 1 else 0 end) as rejected")
        )->first();

        // Paginate the results
        $perPage = $request->input('per_page', 10);
        $reports = $query->paginate($perPage)->withQueryString();

        // Get students for filters
        $students = User::whereHas('reports')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/reports/index', [
            'reports' => $reports->items(),
            'meta' => [
                'total' => $reports->total(),
                'per_page' => $reports->perPage(),
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
            ],
            'filters' => $request->only(['search', 'filter', 'status', 'sort_field', 'sort_direction', 'per_page']),
            'filterOptions' => [
                'students' => $students,
            ],
            'reportStats' => $reportStats,
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

        // Notify the student
        $report->user->notify(new ReportStatusChanged($report));

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
