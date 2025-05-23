<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MahasiswaDashboardController extends Controller
{
    /**
     * Display the mahasiswa dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Ensure the user is a mahasiswa
        abort_unless($user->hasRole('mahasiswa'), 403, 'Unauthorized action.');

        // Get current internship application status
        $internships = Internship::where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get();

        // Get the latest active internship (if any)
        $activeInternship = Internship::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->latest()
            ->first();

        // Get recent logbook entries with approval status
        $recentLogbooks = Logbook::when($activeInternship, function ($query) use ($activeInternship) {
            return $query->where('internship_id', $activeInternship->id);
        })
            ->latest()
            ->take(5)
            ->get();

        // Get submitted reports with their status
        $reports = Report::where('user_id', $user->id)
            ->with('internship')
            ->latest()
            ->take(3)
            ->get();

        // Get upcoming guidance classes
        $upcomingClasses = [];
        if ($user->mahasiswaProfile && $user->mahasiswaProfile->advisor_id) {
            $upcomingClasses = GuidanceClass::where('lecturer_id', $user->mahasiswaProfile->advisor_id)
                ->where('start_date', '>', now())
                ->whereHas('students', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
                ->latest('start_date')
                ->take(3)
                ->get();
        }

        // Get counts for analytics cards
        $counts = [
            'waiting_applications' => Internship::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count(),
            'accepted_internships' => Internship::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->count(),
            'rejected_internships' => Internship::where('user_id', $user->id)
                ->where('status', 'rejected')
                ->count(),
            'total_logbooks' => $activeInternship ? Logbook::where('internship_id', $activeInternship->id)->count() : 0,
            'pending_reports' => Report::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'approved_reports' => Report::where('user_id', $user->id)
                ->where('status', 'approved')
                ->count(),
            'upcoming_classes' => count($upcomingClasses),
        ];

        // Get recent notifications
        $notifications = $user->unreadNotifications()
            ->take(5)
            ->get();

        // Get advisor information if available
        $advisor = null;
        if ($user->mahasiswaProfile && $user->mahasiswaProfile->advisor_id) {
            $advisor = $user->mahasiswaProfile->advisor()->with('dosenProfile')->first();
        }

        return Inertia::render('front/mahasiswa/dashboard', [
            'internships' => $internships,
            'activeInternship' => $activeInternship,
            'recentLogbooks' => $recentLogbooks,
            'reports' => $reports,
            'upcomingClasses' => $upcomingClasses,
            'counts' => $counts,
            'notifications' => $notifications,
            'advisor' => $advisor,
        ]);
    }
}
