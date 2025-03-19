<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        return inertia('admin/dashboard/index', [
            'title' => 'Dashboard',
            'description' => 'Welcome to the admin dashboard.',
        ]);
    }

    public function index()
    {
        return inertia('admin/dashboard/index', [
            'title' => 'Admin Dashboard',
            'description' => 'Welcome to the admin dashboard.',
            'additional_info' => 'This is some additional information for the dashboard.',
        ]);
    }
}
