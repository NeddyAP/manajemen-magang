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
        // Mahasiswa can view their own logbooks, Dosen can view their advisees'
        // Admin can view all. This is typically handled in the controller query.
        // For a general policy, allow if user has a relevant role.
        return $user->hasAnyRole(['mahasiswa', 'dosen', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Logbook $logbook): bool
    {
        // Mahasiswa can view their own logbook.
        if ($user->hasRole('mahasiswa')) {
            return $user->id === $logbook->user_id;
        }

        // Dosen can view logbooks of their advisees.
        if ($user->hasRole('dosen')) {
            // Ensure logbook has an associated user and internship
            if (! $logbook->user || ! $logbook->internship || ! $logbook->internship->user) {
                return false;
            }
            // Check if the logbook's user (student) is an advisee of the current dosen
            $studentProfile = $logbook->internship->user->mahasiswaProfile;

            return $studentProfile && $studentProfile->advisor_id === $user->id;
        }

        // Admin can view any logbook.
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only mahasiswa can create logbooks for their active internships.
        // Further checks (e.g., active internship) are in FormRequest/Controller.
        return $user->hasRole('mahasiswa');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Logbook $logbook): bool
    {
        // Mahasiswa can update their own logbook.
        if ($user->hasRole('mahasiswa')) {
            return $user->id === $logbook->user_id;
        }

        // Dosen can update supervisor_notes on logbooks of their advisees.
        // This policy method might need to be more granular if different fields have different update permissions.
        // For now, if a Dosen is an advisor, they can update (controller/request should limit fields).
        if ($user->hasRole('dosen')) {
            if (! $logbook->user || ! $logbook->internship || ! $logbook->internship->user) {
                return false;
            }
            $studentProfile = $logbook->internship->user->mahasiswaProfile;

            return $studentProfile && $studentProfile->advisor_id === $user->id;
        }

        // Admin can update any logbook.
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Logbook $logbook): bool
    {
        // Mahasiswa can delete their own logbook.
        if ($user->hasRole('mahasiswa')) {
            return $user->id === $logbook->user_id;
        }

        // Admin can delete any logbook.
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Logbook $logbook): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Logbook $logbook): bool
    {
        return false;
    }
}
