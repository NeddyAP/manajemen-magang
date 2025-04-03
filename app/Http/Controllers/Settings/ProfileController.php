<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $userRole = $user->roles->pluck('name');

        $route = 'front/settings/profile';
        if ($userRole->contains('admin') || $userRole->contains('superadmin')) {
            $route = 'admin/settings/profile';
        }

        // Load the appropriate profile based on role
        $profile = null;
        if ($user->hasRole('admin') || $user->hasRole('superadmin')) {
            $profile = $user->adminProfile;
        } elseif ($user->hasRole('dosen')) {
            $profile = $user->dosenProfile;
        } elseif ($user->hasRole('mahasiswa')) {
            $profile = $user->mahasiswaProfile;
        }

        return Inertia::render($route, [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $profile,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $userRole = $user->roles->pluck('name');

        // Update user data
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Update role-specific profile
        if ($user->hasRole('admin') || $user->hasRole('superadmin')) {
            $user->adminProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $request->validated()
            );
        } elseif ($user->hasRole('dosen')) {
            $user->dosenProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $request->validated()
            );
        } elseif ($user->hasRole('mahasiswa')) {
            $user->mahasiswaProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $request->validated()
            );
        }

        return to_route('profile.edit')->with('success', 'Profile berhasil di update');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun berhasil dihapus');;
    }

    public function appearance(Request $request)
    {

        $userRole = $request->user()->roles->pluck('name');

        $route = 'front/settings/appearance';
        if ($userRole->contains('admin') || $userRole->contains('superadmin')) {
            $route = 'admin/settings/appearance';
        }

        return Inertia::render($route);
    }
}
