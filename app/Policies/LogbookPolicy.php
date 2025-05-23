<?php

namespace App\Policies;

use App\Models\Logbook;
use App\Models\User;

class LogbookPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Check if user has permission to view logbooks
        return $user->can('logbooks.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Logbook $logbook): bool
    {
        // If user doesn't have the permission, deny access
        if (! $user->can('logbooks.view')) {
            return false;
        }

        // Admin with proper permissions can view any logbook
        if ($user->can('admin.dashboard.view')) {
            return true;
        }

        // Mahasiswa can view their own logbook
        if ($user->id === $logbook->user_id) {
            return true;
        }

        // Dosen can view logbooks of their advisees
        // Ensure logbook has an associated user and internship
        if (! $logbook->user || ! $logbook->internship || ! $logbook->internship->user) {
            return false;
        }

        // Check if the logbook's user (student) is an advisee of the current dosen
        $studentProfile = $logbook->internship->user->mahasiswaProfile;

        return $studentProfile && $studentProfile->advisor_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Check if user has permission to create logbooks
        return $user->can('logbooks.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Logbook $logbook): bool
    {
        // If user doesn't have the permission, deny access
        if (! $user->can('logbooks.edit')) {
            return false;
        }

        // Admin with proper permissions can update any logbook
        if ($user->can('admin.dashboard.view')) {
            return true;
        }

        // Mahasiswa can update their own logbook
        if ($user->can('logbooks.edit') && $user->id === $logbook->user_id) {
            return true;
        }

        // Dosen can add notes to logbooks of their advisees
        if ($user->can('logbooks.add_notes')) {
            if (! $logbook->user || ! $logbook->internship || ! $logbook->internship->user) {
                return false;
            }
            $studentProfile = $logbook->internship->user->mahasiswaProfile;

            return $studentProfile && $studentProfile->advisor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Logbook $logbook): bool
    {
        // If user doesn't have the permission, deny access
        if (! $user->can('logbooks.delete')) {
            return false;
        }

        // Admin with proper permissions can delete any logbook
        if ($user->can('admin.dashboard.view')) {
            return true;
        }

        // Mahasiswa can delete their own logbook
        return $user->id === $logbook->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Logbook $logbook): bool
    {
        return $user->can('admin.dashboard.view');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Logbook $logbook): bool
    {
        return $user->can('admin.dashboard.view');
    }
}
