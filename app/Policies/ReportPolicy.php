<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class ReportPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @return Response|bool
     */
    public function viewAny(User $user)
    {
        // Assuming any authenticated user associated with an internship can see their list of reports
        return $user->hasRole('mahasiswa');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @return Response|bool
     */
    public function view(User $user, Report $report)
    {
        return $user->id === $report->user_id;
    }

    /**
     * Determine whether the user can create models.
     *
     * @return Response|bool
     */
    public function create(User $user)
    {
        // Logic to check if user has an active internship, etc.
        // For now, allowing any mahasiswa to attempt creation,
        // controller/request validation will handle specific internship checks.
        return $user->hasRole('mahasiswa');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @return Response|bool
     */
    public function update(User $user, Report $report)
    {
        return $user->id === $report->user_id &&
               ($report->status === 'pending' || $report->status === 'rejected');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @return Response|bool
     */
    public function delete(User $user, Report $report)
    {
        return $user->id === $report->user_id && $report->status === 'pending';
    }

    /**
     * Determine whether the user (Dosen or Admin) can approve or reject the report.
     *
     * @return Response|bool
     */
    public function approveOrReject(User $user, Report $report)
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('dosen')) {
            // Check if the Dosen is the advisor for the student who owns the internship related to the report
            $internship = $report->internship;
            if ($internship && $internship->user && $internship->user->mahasiswaProfile) {
                return $internship->user->mahasiswaProfile->advisor_id === $user->id;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @return Response|bool
     */
    public function restore(User $user, Report $report)
    {
        return false; // Or implement if needed
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @return Response|bool
     */
    public function forceDelete(User $user, Report $report)
    {
        return false; // Or implement if needed
    }
}
