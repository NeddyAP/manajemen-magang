<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TutorialController extends Controller
{
    public function index(Request $request)
    {
        // Determine user role access levels more efficiently
        $userRoles = collect(); // Initialize as an empty collection
        if (Auth::check()) { // Check if user is authenticated
            $userRoles = Auth::user()->roles->pluck('name');
        }

        $accessLevels = ['all']; // Start with 'all' access

        // Add access levels based on roles (works correctly on the collection)
        if ($userRoles->contains('admin') || $userRoles->contains('superadmin')) {
            $accessLevels = array_merge($accessLevels, ['admin', 'dosen', 'mahasiswa']);
        }
        if ($userRoles->contains('dosen')) {
            $accessLevels[] = 'dosen';
        }
        if ($userRoles->contains('mahasiswa')) {
            $accessLevels[] = 'mahasiswa';
        }
        // Ensure unique access levels
        $accessLevels = array_unique($accessLevels);

        // Build the base query
        $query = Tutorial::where('is_active', 1)
            ->whereIn('access_level', $accessLevels);

        // Apply search filter if provided
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        // Get sorted results
        $tutorials = $query->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('front/tutorials/index', compact('tutorials'));
    }
}
