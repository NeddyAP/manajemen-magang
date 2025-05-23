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
        // Check if user has permission to view reports
        return $user->can('reports.view');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @return Response|bool
     */
    public function view(User $user, Report $report)
    {
        // If user doesn't have permission to view reports, deny access
        if (! $user->can('reports.view')) {
            return false;
        }

        // Admin with proper permissions can view any report
        if ($user->can('admin.dashboard.view')) {
            return true;
        }

        // Dosen can view reports of their advisees
        if ($user->can('reports.approve')) {
            $internship = $report->internship;
            if ($internship && $internship->user && $internship->user->mahasiswaProfile) {
                if ($internship->user->mahasiswaProfile->advisor_id === $user->id) {
                    return true;
                }
            }
        }

        // User can view their own reports
        return $user->id === $report->user_id;
    }

    /**
     * Determine whether the user can create models.
     *
     * @return Response|bool
     */
    public function create(User $user)
    {
        // Check if user has permission to create reports
        return $user->can('reports.create');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @return Response|bool
     */
    public function update(User $user, Report $report)
    {
        // If user doesn't have permission to edit reports, deny access
        if (! $user->can('reports.edit')) {
            return false;
        }

        // Only allow editing if the report is pending or rejected
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
        // If user doesn't have permission to delete reports, deny access
        if (! $user->can('reports.delete')) {
            return false;
        }

        // Only allow deletion if the report is pending and belongs to the user
        return $user->id === $report->user_id && $report->status === 'pending';
    }

    /**
     * Determine whether the user (Dosen or Admin) can approve or reject the report.
     *
     * @return Response|bool
     */
    public function approveOrReject(User $user, Report $report)
    {
        // Check if user has permission to approve reports
        if (! $user->can('reports.approve')) {
            return false;
        }

        // Admin with proper permissions can approve any report
        if ($user->can('admin.dashboard.view')) {
            return true;
        }

        // Dosen can only approve reports of their advisees
        $internship = $report->internship;
        if ($internship && $internship->user && $internship->user->mahasiswaProfile) {
            return $internship->user->mahasiswaProfile->advisor_id === $user->id;
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
        // Only admin can restore deleted reports
        return $user->can('admin.dashboard.view');
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @return Response|bool
     */
    public function forceDelete(User $user, Report $report)
    {
        // Only admin can force delete reports
        return $user->can('admin.dashboard.view');
    }
}
