<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        return inertia('admin/dashboard/index', [
            'title' => 'Dasbor',
            'description' => 'Selamat datang di dasbor admin.',
        ]);
    }

    public function index()
    {
        return inertia('admin/dashboard/index', [
            'title' => 'Dasbor Admin',
            'description' => 'Selamat datang di dasbor admin.',
            'additional_info' => 'Ini adalah informasi tambahan untuk dasbor.',
        ]);
    }
}
