<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DosenDashboardController extends Controller
{
    /**
     * Display the dosen dashboard.
     */
    public function index()
    {
        $user = Auth::user();

        // Ensure the user is a dosen
        if (! $user->hasRole('dosen')) {
            abort(403, 'Unauthorized action.');
        }

        // Get advisee IDs
        $adviseeIds = $user->advisees()->pluck('user_id');

        // Get supervised students with their internship status
        $supervisedStudents = User::whereIn('id', $adviseeIds)
            ->with(['mahasiswaProfile', 'internships' => function ($query) {
                $query->latest()->first();
            }])
            ->withCount(['internships' => function ($query) {
                $query->where('status', 'accepted');
            }])
            ->take(5)
            ->get();

        // Get recent logbook entries requiring review
        $pendingLogbooks = Logbook::whereHas('internship', function ($query) use ($adviseeIds) {
            $query->whereIn('user_id', $adviseeIds)
                ->where('status', 'accepted');
        })
            ->whereNull('supervisor_notes')
            ->with(['internship.user', 'internship'])
            ->latest()
            ->take(5)
            ->get();

        // Get reports that need evaluation
        $pendingReports = Report::whereHas('internship', function ($query) use ($adviseeIds) {
            $query->whereIn('user_id', $adviseeIds)
                ->where('status', 'accepted');
        })
            ->where('status', 'pending')
            ->with(['user', 'internship'])
            ->latest()
            ->take(5)
            ->get();

        // Get upcoming guidance classes
        $upcomingClasses = GuidanceClass::where('lecturer_id', $user->id)
            ->where('start_date', '>', now())
            ->with(['students' => function ($query) {
                $query->take(3); // Limit to 3 students per class for preview
            }])
            ->latest('start_date')
            ->take(3)
            ->get();

        // Get counts for analytics cards
        $counts = [
            'total_advisees' => $user->advisees()->count(),
            'active_internships' => Internship::whereIn('user_id', $adviseeIds)
                ->where('status', 'accepted')
                ->count(),
            'pending_logbooks' => Logbook::whereHas('internship', function ($query) use ($adviseeIds) {
                $query->whereIn('user_id', $adviseeIds)
                    ->where('status', 'accepted');
            })
                ->whereNull('supervisor_notes')
                ->count(),
            'pending_reports' => Report::whereHas('internship', function ($query) use ($adviseeIds) {
                $query->whereIn('user_id', $adviseeIds)
                    ->where('status', 'accepted');
            })
                ->where('status', 'pending')
                ->count(),
            'upcoming_classes' => GuidanceClass::where('lecturer_id', $user->id)
                ->where('start_date', '>', now())
                ->count(),
        ];

        // Get recent notifications
        $notifications = $user->unreadNotifications()
            ->take(5)
            ->get();

        return Inertia::render('front/dosen/dashboard', [
            'supervisedStudents' => $supervisedStudents,
            'pendingLogbooks' => $pendingLogbooks,
            'pendingReports' => $pendingReports,
            'upcomingClasses' => $upcomingClasses,
            'counts' => $counts,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Display a comprehensive dashboard for dosen to monitor their supervised students' progress.
     */
    public function studentsProgress(Request $request)
    {
        // Ensure the user is a dosen
        $user = Auth::user();
        if (! $user->hasRole('dosen')) {
            abort(403, 'Only dosen can access this page.');
        }

        // Get all advisees (students supervised by this dosen)
        $advisees = $user->advisees()
            ->with([
                'user' => function ($query) {
                    $query->with('roles');
                },
                'user.internships' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
            ])
            ->get()
            ->map(function ($mahasiswaProfile) {
                return $mahasiswaProfile->user;
            });

        // Get the IDs of all advisee users
        $adviseeUserIds = $advisees->pluck('id')->toArray();

        // Get all internships for these students
        $internships = Internship::whereIn('user_id', $adviseeUserIds)
            ->with(['user', 'logbooks', 'reports'])
            ->get();

        // Get active internships (status = accepted)
        $activeInternships = $internships->where('status', 'accepted');
        $activeInternshipIds = $activeInternships->pluck('id')->toArray();

        // Get logbooks for active internships
        $logbooks = Logbook::whereIn('internship_id', $activeInternshipIds)
            ->with(['internship.user'])
            ->get();

        // Get reports for active internships
        $reports = Report::whereIn('internship_id', $activeInternshipIds)
            ->with(['internship.user'])
            ->get();

        // Get upcoming guidance classes
        $upcomingClasses = GuidanceClass::where('lecturer_id', $user->id)
            ->where('start_date', '>', now())
            ->with(['students'])
            ->get();

        // Calculate statistics and progress for each student
        $studentsProgress = $advisees->map(function ($student) use ($internships, $logbooks, $reports) {
            // Get the student's internships
            $studentInternships = $internships->where('user_id', $student->id);
            $activeInternship = $studentInternships->where('status', 'accepted')->first();

            // Calculate logbook progress if there's an active internship
            $logbookProgress = 0;
            $logbookCount = 0;
            $totalLogbookDays = 0;

            if ($activeInternship) {
                // Get logbooks for this internship
                $studentLogbooks = $logbooks->where('internship_id', $activeInternship->id);
                $logbookCount = $studentLogbooks->count();

                // Calculate total days in internship
                if ($activeInternship->start_date && $activeInternship->end_date) {
                    $startDate = \Carbon\Carbon::parse($activeInternship->start_date);
                    $endDate = \Carbon\Carbon::parse($activeInternship->end_date);
                    $totalLogbookDays = $endDate->diffInDays($startDate) + 1;

                    // Calculate progress percentage
                    $logbookProgress = $totalLogbookDays > 0 ? round(($logbookCount / $totalLogbookDays) * 100) : 0;
                }
            }

            // Get report status
            $reportStatus = [
                'submitted' => 0,
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ];

            if ($activeInternship) {
                $studentReports = $reports->where('internship_id', $activeInternship->id);
                $reportStatus['submitted'] = $studentReports->count();
                $reportStatus['pending'] = $studentReports->where('status', 'pending')->count();
                $reportStatus['approved'] = $studentReports->where('status', 'approved')->count();
                $reportStatus['rejected'] = $studentReports->where('status', 'rejected')->count();
            }

            // Get pending items that require dosen review
            $pendingItems = [
                'logbooks' => $activeInternship ? $logbooks->where('internship_id', $activeInternship->id)
                    ->whereNull('supervisor_notes')->count() : 0,
                'reports' => $activeInternship ? $reports->where('internship_id', $activeInternship->id)
                    ->where('status', 'pending')->count() : 0,
            ];

            // Get internship status
            $internshipStatus = [
                'waiting' => $studentInternships->where('status', 'waiting')->count(),
                'accepted' => $studentInternships->where('status', 'accepted')->count(),
                'rejected' => $studentInternships->where('status', 'rejected')->count(),
            ];

            // Get completion status for active internship
            $completionStatus = $activeInternship ? $activeInternship->completion_status : null;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'profile' => $student->mahasiswaProfile,
                'internship_status' => $internshipStatus,
                'active_internship' => $activeInternship,
                'logbook_progress' => [
                    'count' => $logbookCount,
                    'total_days' => $totalLogbookDays,
                    'percentage' => $logbookProgress,
                ],
                'report_status' => $reportStatus,
                'pending_items' => $pendingItems,
                'completion_status' => $completionStatus,
            ];
        })->values();

        // Calculate summary statistics (before filtering)
        $summary = [
            'total_students' => $advisees->count(),
            'active_internships' => $activeInternships->count(),
            'pending_logbooks' => $logbooks->whereNull('supervisor_notes')->count(),
            'pending_reports' => $reports->where('status', 'pending')->count(),
            'upcoming_classes' => $upcomingClasses->count(),
        ];

        // Apply sorting if provided
        if ($request->has('sort_field') && $request->has('sort_direction')) {
            $sortField = $request->sort_field;
            $sortDirection = $request->sort_direction;

            $studentsProgress = $studentsProgress->sortBy(function ($student) use ($sortField) {
                if ($sortField === 'name') {
                    return $student['name'];
                } elseif ($sortField === 'internship_status') {
                    return $student['active_internship'] ? 1 : 0;
                } elseif ($sortField === 'logbook_progress') {
                    return $student['logbook_progress']['percentage'];
                } elseif ($sortField === 'report_status') {
                    return $student['report_status']['submitted'];
                }

                return $student[$sortField] ?? '';
            }, $sortDirection === 'desc');

            if ($sortDirection === 'desc') {
                $studentsProgress = $studentsProgress->reverse();
            }
        } else {
            // Default sorting by name
            $studentsProgress = $studentsProgress->sortBy('name');
        }

        // Apply filters if provided
        if ($request->has('filter') && ! empty($request->filter)) {
            $filter = $request->filter;

            if ($filter === 'active') {
                $studentsProgress = $studentsProgress->filter(function ($student) {
                    return $student['internship_status']['accepted'] > 0;
                });
            } elseif ($filter === 'waiting') {
                $studentsProgress = $studentsProgress->filter(function ($student) {
                    return $student['internship_status']['waiting'] > 0;
                });
            } elseif ($filter === 'completed') {
                $studentsProgress = $studentsProgress->filter(function ($student) {
                    return $student['completion_status'] === 'Selesai';
                });
            } elseif ($filter === 'pending_review') {
                $studentsProgress = $studentsProgress->filter(function ($student) {
                    return $student['pending_items']['logbooks'] > 0 || $student['pending_items']['reports'] > 0;
                });
            }

            $studentsProgress = $studentsProgress->values();
        }

        // Apply search if provided
        if ($request->has('search') && ! empty($request->search)) {
            $search = strtolower($request->search);
            $studentsProgress = $studentsProgress->filter(function ($student) use ($search) {
                return str_contains(strtolower($student['name']), $search) ||
                       str_contains(strtolower($student['email']), $search) ||
                       str_contains(strtolower($student['profile']['student_number'] ?? ''), $search) ||
                       str_contains(strtolower($student['profile']['study_program'] ?? ''), $search);
            })->values();
        }

        // Implement pagination
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        $total = $studentsProgress->count();
        $lastPage = ceil($total / $perPage);

        // Ensure current page is valid
        $page = max(1, min($page, $lastPage));

        // Get items for current page
        $items = $studentsProgress->forPage($page, $perPage)->values();

        return Inertia::render('front/dosen/students-progress', [
            'students' => $items,
            'summary' => $summary,
            'filters' => $request->only(['search', 'filter', 'sort_field', 'sort_direction']),
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
            ],
        ]);
    }
}
