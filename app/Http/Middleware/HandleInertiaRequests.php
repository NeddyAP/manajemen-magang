<?php

namespace App\Http\Middleware;

use App\Models\GlobalVariable;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'role' => $request->user()?->roles?->first()?->name,
                'permissions' => $request->user()?->getAllPermissions()->pluck('name'),
                'mahasiswa_profile' => $request->user()?->mahasiswa_profile,
                'dosen_profile' => $request->user()?->dosen_profile,
                'admin_profile' => $request->user()?->admin_profile,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'globalVariables' => GlobalVariable::where('is_active', 1)->get(),
            'google' => [
                'client_id' => config('services.google.client_id'),
            ],
        ]);
    }
}
