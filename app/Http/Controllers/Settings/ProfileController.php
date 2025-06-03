<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
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

        // Get all validated data first
        $validatedData = $request->validated();
        $newAvatarPath = null;

        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $newAvatarPath = $path; // Store new path separately
        }

        // Remove avatar from $validatedData to prevent accidental nullification
        // if no new file is uploaded. We'll set it explicitly if $newAvatarPath is not null.
        unset($validatedData['avatar']);

        // Fill user with other validated data
        $user->fill($validatedData);

        // If a new avatar was uploaded, set it now
        if ($newAvatarPath) {
            $user->avatar = $newAvatarPath;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Update role-specific profile
        // Exclude avatar from role-specific profile updates as it's on the user model
        $profileData = $request->except('avatar');

        if ($user->hasRole('admin') || $user->hasRole('superadmin')) {
            $user->adminProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        } elseif ($user->hasRole('dosen')) {
            $user->dosenProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        } elseif ($user->hasRole('mahasiswa')) {
            $user->mahasiswaProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
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

        // Delete avatar from storage
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun berhasil dihapus');
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

    /**
     * Link Google account to the authenticated user.
     */
    public function linkGoogleAccount(Request $request): RedirectResponse
    {
        // Validate the incoming request
        $request->validate([
            'id_token' => ['required', 'string'],
        ]);

        try {
            // Verify the Google ID token using Google's tokeninfo endpoint
            $googlePayload = $this->verifyGoogleIdToken($request->id_token);

            if (! $googlePayload) {
                return back()->with('error', 'Token Google tidak valid.');
            }

            $user = $request->user();
            $googleId = $googlePayload['sub']; // Google user ID
            $googleEmail = $googlePayload['email'];

            // Check if this Google ID is already linked to another user
            $existingUserWithGoogleId = User::where('google_id', $googleId)
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingUserWithGoogleId) {
                return back()->with('error', 'Akun Google ini sudah terhubung dengan akun lain.');
            }

            // Link the Google account to the current user
            $user->update([
                'google_id' => $googleId,
                'google_email' => $googleEmail,
            ]);

            return back()->with('success', 'Akun Google berhasil ditautkan.');

        } catch (Exception $e) {
            // Log the error for debugging
            logger('Google Account Linking Error: '.$e->getMessage());

            return back()->with('error', 'Terjadi kesalahan saat menautkan akun Google. Silakan coba lagi.');
        }
    }

    /**
     * Verify Google ID token using Google's tokeninfo endpoint
     */
    private function verifyGoogleIdToken(string $idToken): ?array
    {
        try {
            // Use Google's tokeninfo endpoint to verify the ID token
            $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (! $response->successful()) {
                logger('Google tokeninfo API error: '.$response->body());

                return null;
            }

            $payload = $response->json();

            // Verify the token claims
            $googleClientId = config('services.google.client_id');

            // Check if the audience matches our client ID
            if (! isset($payload['aud']) || $payload['aud'] !== $googleClientId) {
                logger('Invalid audience in Google ID token. Expected: '.$googleClientId.', Got: '.($payload['aud'] ?? 'null'));

                return null;
            }

            // Check if the token has required fields
            if (! isset($payload['sub']) || ! isset($payload['email'])) {
                logger('Missing required fields in Google ID token payload');

                return null;
            }

            // Check if email is verified
            if (! isset($payload['email_verified']) || $payload['email_verified'] !== 'true') {
                logger('Email not verified in Google ID token');

                return null;
            }

            return $payload;

        } catch (Exception $e) {
            logger('Google ID Token Verification Error: '.$e->getMessage());

            return null;
        }
    }
}
