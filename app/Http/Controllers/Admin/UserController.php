<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles'])
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            });

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhereHas('roles', function ($q) use ($searchTerm) {
                        $q->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Handle filters
        if ($request->has('filter')) {
            foreach ($request->filter as $column => $value) {
                $query->where($column, 'like', "%{$value}%");
            }
        }

        // Handle sorting
        if ($request->has('sort_field')) {
            $direction = $request->input('sort_direction', 'asc');
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Paginate the results
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return inertia('admin/users/index', [
            'users' => $users->items(),
            'meta' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'roles' => Role::get(),
            ],
        ]);
    }
}
