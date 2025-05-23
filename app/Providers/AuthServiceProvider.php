<?php

namespace App\Providers;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Policies\InternshipPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ReportPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Report::class => ReportPolicy::class,
        Logbook::class => LogbookPolicy::class,
        Internship::class => InternshipPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Grant all permissions to superadmin role
        Gate::before(function ($user, $ability) {
            return $user->hasRole('superadmin') ? true : null;
        });
    }
}
