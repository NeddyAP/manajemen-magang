<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    /**
     * Redirect the user to Google authentication page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback and authenticate the user.
     */
    public function callback(): RedirectResponse
    {
        try {
            // Get user data from Google
            $googleUser = Socialite::driver('google')->user();

            // Check if user already exists with this Google ID
            $user = User::where('google_id', $googleUser->getId())->first();

            if ($user) {
                // User exists with Google ID, update tokens and login
                $user->update([
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                ]);

                Auth::login($user);

                return redirect()->intended('/');
            }

            // Check if user exists with the same email
            $existingUser = User::where('email', $googleUser->getEmail())->first();

            if ($existingUser) {
                // Check if the existing user already has a google_id
                if ($existingUser->google_id) {
                    // User has Google ID but different from current one - this shouldn't normally happen
                    // but handle gracefully by updating tokens
                    $existingUser->update([
                        'google_id' => $googleUser->getId(),
                        'google_token' => $googleUser->token,
                        'google_refresh_token' => $googleUser->refreshToken,
                    ]);

                    Auth::login($existingUser);

                    return redirect()->intended('/');
                } else {
                    // User exists but no google_id - do not automatically link
                    // Redirect with error message asking user to login manually first
                    return redirect('/login')
                        ->with('error', 'Akun kamu belum tersambung ... login manual lalu sambungkan dengan google di pengaturan profile');
                }
            }

            // No existing user found - do not create new user
            // Redirect with error message asking user to login manually first
            return redirect('/login')
                ->with('error', 'Akun kamu belum tersambung ... login manual lalu sambungkan dengan google di pengaturan profile');

        } catch (Exception $e) {
            // Log the error for debugging
            logger('Google OAuth Error: '.$e->getMessage());

            // Redirect back to login with error message
            return redirect('/login')
                ->with('error', 'Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.');
        }
    }
}
