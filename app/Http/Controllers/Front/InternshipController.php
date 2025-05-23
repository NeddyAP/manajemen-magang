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

class InternshipController extends Controller
{
    /**
     * Display the main internship hub with relevant counts.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $counts = [];
        $dashboardData = [];
        $userRole = '';

        if ($user->hasRole('mahasiswa')) {
            $userRole = 'mahasiswa';

            // Basic counts for both views
            $counts['waiting_applications'] = Internship::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count();
            $counts['accepted_internships'] = Internship::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->count();
            $counts['rejected_internships'] = Internship::where('user_id', $user->id)
                ->where('status', 'rejected')
                ->count();

            if ($user->mahasiswaProfile?->advisor_id) {
                $counts['upcoming_classes'] = GuidanceClass::where('lecturer_id', $user->mahasiswaProfile->advisor_id)
                    ->where('start_date', '>', now())
                    ->count();
            } else {
                $counts['upcoming_classes'] = 0;
            }

            // Additional data for dashboard view
            $internships = Internship::where('user_id', $user->id)
                ->latest()
                ->take(3)
                ->get();

            $activeInternship = Internship::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->latest()
                ->first();

            $recentLogbooks = [];
            $totalLogbooks = 0;

            if ($activeInternship) {
                $recentLogbooks = Logbook::where('internship_id', $activeInternship->id)
                    ->latest()
                    ->take(5)
                    ->get();

                $totalLogbooks = Logbook::where('internship_id', $activeInternship->id)->count();
            }

            $reports = Report::where('user_id', $user->id)
                ->with('internship')
                ->latest()
                ->take(3)
                ->get();

            $pendingReports = Report::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count();

            $approvedReports = Report::where('user_id', $user->id)
                ->where('status', 'approved')
                ->count();

            $upcomingClasses = [];
            $advisor = null;

            if ($user->mahasiswaProfile && $user->mahasiswaProfile->advisor_id) {
                $upcomingClasses = GuidanceClass::where('lecturer_id', $user->mahasiswaProfile->advisor_id)
                    ->where('start_date', '>', now())
                    ->whereHas('students', function ($query) use ($user) {
                        $query->where('users.id', $user->id);
                    })
                    ->latest('start_date')
                    ->take(3)
                    ->get();

                $advisor = $user->mahasiswaProfile->advisor()->with('dosenProfile')->first();
            }

            $dashboardData = [
                'internships' => $internships,
                'activeInternship' => $activeInternship,
                'recentLogbooks' => $recentLogbooks,
                'reports' => $reports,
                'mahasiswaUpcomingClasses' => $upcomingClasses,
                'mahasiswaCounts' => [
                    'waiting_applications' => $counts['waiting_applications'],
                    'accepted_internships' => $counts['accepted_internships'],
                    'rejected_internships' => $counts['rejected_internships'],
                    'total_logbooks' => $totalLogbooks,
                    'pending_reports' => $pendingReports,
                    'approved_reports' => $approvedReports,
                    'upcoming_classes' => $counts['upcoming_classes'],
                ],
                'advisor' => $advisor,
            ];

        } elseif ($user->hasRole('dosen')) {
            $userRole = 'dosen';
            $adviseeIds = $user->advisees()->pluck('user_id');

            // Basic counts for both views
            $counts['waiting_applications'] = Internship::whereIn('user_id', $adviseeIds)
                ->where('status', 'waiting')
                ->count();
            $counts['accepted_internships'] = Internship::whereIn('user_id', $adviseeIds)
                ->where('status', 'accepted')
                ->count();
            $counts['pending_logbooks'] = Logbook::whereHas('internship', function ($q) use ($adviseeIds): void {
                $q->whereIn('user_id', $adviseeIds)->where('status', 'accepted');
            })
                ->whereNull('supervisor_notes')
                ->count();
            $counts['pending_reports'] = Report::whereHas('internship', function ($q) use ($adviseeIds): void {
                $q->whereIn('user_id', $adviseeIds)->where('status', 'accepted');
            })
                ->where('status', 'pending')
                ->count();
            $counts['upcoming_classes'] = GuidanceClass::where('lecturer_id', $user->id)
                ->where('start_date', '>', now())
                ->count();

            // Additional data for dashboard view
            $supervisedStudents = User::whereIn('id', $adviseeIds)
                ->with(['mahasiswaProfile', 'internships' => function ($query) {
                    $query->latest()->first();
                }])
                ->withCount(['internships' => function ($query) {
                    $query->where('status', 'accepted');
                }])
                ->take(5)
                ->get();

            $pendingLogbooks = Logbook::whereHas('internship', function ($query) use ($adviseeIds) {
                $query->whereIn('user_id', $adviseeIds)
                    ->where('status', 'accepted');
            })
                ->whereNull('supervisor_notes')
                ->with(['internship.user', 'internship'])
                ->latest()
                ->take(5)
                ->get();

            $pendingReports = Report::whereHas('internship', function ($query) use ($adviseeIds) {
                $query->whereIn('user_id', $adviseeIds)
                    ->where('status', 'accepted');
            })
                ->where('status', 'pending')
                ->with(['user', 'internship'])
                ->latest()
                ->take(5)
                ->get();

            $upcomingClasses = GuidanceClass::where('lecturer_id', $user->id)
                ->where('start_date', '>', now())
                ->with(['students' => function ($query) {
                    $query->take(3);
                }])
                ->latest('start_date')
                ->take(3)
                ->get();

            $dashboardData = [
                'supervisedStudents' => $supervisedStudents,
                'pendingLogbooks' => $pendingLogbooks,
                'pendingReports' => $pendingReports,
                'dosenUpcomingClasses' => $upcomingClasses,
                'dosenCounts' => [
                    'total_advisees' => $user->advisees()->count(),
                    'active_internships' => $counts['accepted_internships'],
                    'pending_logbooks' => $counts['pending_logbooks'],
                    'pending_reports' => $counts['pending_reports'],
                    'upcoming_classes' => $counts['upcoming_classes'],
                ],
            ];
        }

        // Get notifications for both roles
        $notifications = $user->unreadNotifications()->take(5)->get();
        $dashboardData['notifications'] = $notifications;

        return Inertia::render('front/internships/index', [
            'counts' => $counts,
            'dashboardData' => $dashboardData,
            'userRole' => $userRole,
            'viewPreference' => $request->cookie('internships_view_preference', 'cards'),
        ]);
    }
}
