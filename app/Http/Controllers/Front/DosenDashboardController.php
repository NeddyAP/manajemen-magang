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
    public function index(Request $request)
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
}
