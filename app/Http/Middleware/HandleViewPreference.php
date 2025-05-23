<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class HandleViewPreference
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $response = $next($request);

        // Check if the request has a view preference parameter
        if ($request->has('view_preference')) {
            $viewPreference = $request->input('view_preference');

            // Only accept valid view preferences
            if (in_array($viewPreference, ['cards', 'dashboard'])) {
                // Set the cookie for 1 year (in minutes)
                $response->cookie('internships_view_preference', $viewPreference, 60 * 24 * 365);
            }
        }

        return $response;
    }
}
