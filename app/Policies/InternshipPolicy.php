<?php

namespace App\Policies;

use App\Models\Internship;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InternshipPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('internships.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Internship $internship): bool
    {
        // Admin can view any internship
        if ($user->hasAnyRole(['admin', 'superadmin'])) {
            return true;
        }

        // Mahasiswa can view their own internships
        if ($user->hasRole('mahasiswa')) {
            return $internship->user_id === $user->id;
        }

        // Dosen can view internships of their advisees
        if ($user->hasRole('dosen')) {
            $studentProfile = $internship->user->mahasiswaProfile;

            return $studentProfile && $studentProfile->advisor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('internships.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Internship $internship): bool
    {
        // Only the owner can update their internship, and only if it's not already approved
        if ($user->hasRole('mahasiswa')) {
            return $internship->user_id === $user->id && $internship->status !== 'accepted';
        }

        // Admin can update any internship
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Internship $internship): bool
    {
        // Only the owner can delete their internship, and only if it's not already approved
        if ($user->hasRole('mahasiswa')) {
            return $internship->user_id === $user->id && $internship->status !== 'accepted';
        }

        // Admin can delete any internship
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    /**
     * Determine whether the user can approve or reject the internship.
     */
    public function approve(User $user, Internship $internship): bool
    {
        // Check if user has the permission
        if (! $user->can('internships.approve')) {
            return false;
        }

        // Admin can approve any internship
        if ($user->hasAnyRole(['admin', 'superadmin'])) {
            return true;
        }

        // Dosen can only approve internships of their advisees
        if ($user->hasRole('dosen')) {
            $studentProfile = $internship->user->mahasiswaProfile;

            return $studentProfile && $studentProfile->advisor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can reject the internship.
     */
    public function reject(User $user, Internship $internship): bool
    {
        // Use the same logic as approve
        return $this->approve($user, $internship);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Internship $internship): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Internship $internship): bool
    {
        return $user->hasAnyRole(['admin', 'superadmin']);
    }
}
