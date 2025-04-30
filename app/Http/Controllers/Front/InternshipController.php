<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InternshipController extends Controller
{
    /**
     * Display the main internship hub with relevant counts.
     */
    public function index()
    {
        $user = Auth::user();
        $counts = [];

        if ($user->hasRole('mahasiswa')) {
            $counts['waiting_applications'] = Internship::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count();
            $counts['accepted_internships'] = Internship::where('user_id', $user->id)
                ->where('status', 'accepted')
                ->count();
            if ($user->mahasiswaProfile?->advisor_id) {
                $counts['upcoming_classes'] = GuidanceClass::where('lecturer_id', $user->mahasiswaProfile->advisor_id)
                    ->where('start_date', '>', now())
                    ->count();
            } else {
                $counts['upcoming_classes'] = 0;
            }
        } elseif ($user->hasRole('dosen')) {
            $adviseeIds = $user->advisees()->pluck('user_id'); // Assuming 'advisees' relationship exists on User model for Dosen

            $counts['waiting_applications'] = Internship::whereIn('user_id', $adviseeIds)
                ->where('status', 'waiting')
                ->count();
            $counts['accepted_internships'] = Internship::whereIn('user_id', $adviseeIds)
                ->where('status', 'accepted')
                ->count();
            $counts['pending_logbooks'] = Logbook::whereHas('internship', function ($q) use ($adviseeIds) {
                $q->whereIn('user_id', $adviseeIds)->where('status', 'accepted');
            })
                ->whereNull('supervisor_notes') // Assuming null notes means pending review
                ->count();
            $counts['pending_reports'] = Report::whereHas('internship', function ($q) use ($adviseeIds) {
                $q->whereIn('user_id', $adviseeIds)->where('status', 'accepted');
            })
                ->where('status', 'pending')
                ->count();
            $counts['upcoming_classes'] = GuidanceClass::where('lecturer_id', $user->id)
                ->where('start_date', '>', now())
                ->count();
        }

        return Inertia::render('front/internships/index', [
            'counts' => $counts,
        ]);
    }
}
