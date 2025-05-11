<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\StoreRequest;
use App\Http\Requests\Admin\User\UpdateRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Log;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles'])
            ->when($request->role, function ($query, $role): void {
                $query->whereHas('roles', function ($q) use ($role): void {
                    $q->where('name', $role);
                });
            });

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm): void {
                $q->where('name', 'like', "{$searchTerm}%")
                    ->orWhere('email', 'like', "{$searchTerm}%")
                    ->orWhereHas('roles', function ($q) use ($searchTerm): void {
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

    public function create()
    {
        // get all dosen for mahasiswa dropdown
        $lecturers = User::with(['roles'])->select('id', 'name')
            ->whereHas('roles', function ($query): void {
                $query->where('name', 'dosen');
            })
            ->get();

        return inertia('admin/users/create', [
            'roles' => Role::get(),
            'lecturers' => $lecturers,
        ]);
    }

    public function store(StoreRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->assignRole($request->roles);

            // Create profile based on role
            switch ($request->roles[0]) {
                case 'admin':
                    $user->adminProfile()->create([
                        'employee_id' => $request->employee_id,
                        'department' => $request->department,
                        'position' => $request->position,
                        'employment_status' => $request->employment_status,
                        'join_date' => $request->join_date,
                        'phone_number' => $request->phone_number,
                        'address' => $request->address,
                        'supervisor_name' => $request->supervisor_name,
                        'work_location' => $request->work_location,
                    ]);
                    break;
                case 'dosen':
                    $user->dosenProfile()->create([
                        'employee_number' => $request->employee_number,
                        'expertise' => $request->expertise,
                        'last_education' => $request->last_education,
                        'academic_position' => $request->academic_position,
                        'employment_status' => $request->employment_status,
                        'teaching_start_year' => (int) $request->teaching_start_year,
                    ]);
                    break;
                case 'mahasiswa':
                    $user->mahasiswaProfile()->create([
                        'student_number' => $request->student_number,
                        'study_program' => $request->study_program,
                        'class_year' => (int) $request->class_year,
                        'academic_status' => $request->academic_status,
                        'semester' => $request->semester,
                        'advisor_id' => $request->advisor_id,
                        'gpa' => $request->gpa,
                    ]);
                    break;
            }

            DB::commit();

            return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil dibuat.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('User creation failed: '.$e->getMessage());
            Log::error('Request data: '.json_encode($request->all()));

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal membuat pengguna. '.$e->getMessage()]);
        }
    }

    public function show(User $user)
    {
        $user->load(['roles', 'adminProfile', 'dosenProfile', 'mahasiswaProfile.advisor.dosenProfile']);

        return inertia('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'adminProfile', 'dosenProfile', 'mahasiswaProfile']);

        // Get all dosen for mahasiswa dropdown
        $lecturers = User::with(['roles'])->select('id', 'name')
            ->whereHas('roles', function ($query): void {
                $query->where('name', 'dosen');
            })
            ->get();

        return inertia('admin/users/edit', [
            'user' => $user,
            'roles' => Role::get(),
            'lecturers' => $lecturers,
        ]);
    }

    public function update(UpdateRequest $request, User $user)
    {
        try {
            DB::beginTransaction();

            // Update user data
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if (! empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Check if role has changed
            $currentRole = $user->roles->first()->name ?? null;
            $newRole = $request->roles[0] ?? null;

            // Update roles
            $user->syncRoles($request->roles);

            // If role changed, delete old profile and create new one
            if ($currentRole !== $newRole) {
                // Delete old profile
                if ($currentRole === 'admin') {
                    $user->adminProfile?->delete();
                } elseif ($currentRole === 'dosen') {
                    $user->dosenProfile?->delete();
                } elseif ($currentRole === 'mahasiswa') {
                    $user->mahasiswaProfile?->delete();
                }

                // Create new profile based on role
                switch ($newRole) {
                    case 'admin':
                        $user->adminProfile()->create([
                            'employee_id' => $request->employee_id,
                            'department' => $request->department,
                            'position' => $request->position,
                            'employment_status' => $request->employment_status,
                            'join_date' => $request->join_date,
                            'phone_number' => $request->phone_number,
                            'address' => $request->address,
                            'supervisor_name' => $request->supervisor_name,
                            'work_location' => $request->work_location,
                        ]);
                        break;
                    case 'dosen':
                        $user->dosenProfile()->create([
                            'employee_number' => $request->employee_number,
                            'expertise' => $request->expertise,
                            'last_education' => $request->last_education,
                            'academic_position' => $request->academic_position,
                            'employment_status' => $request->employment_status,
                            'teaching_start_year' => (int) $request->teaching_start_year,
                        ]);
                        break;
                    case 'mahasiswa':
                        $user->mahasiswaProfile()->create([
                            'student_number' => $request->student_number,
                            'study_program' => $request->study_program,
                            'class_year' => (int) $request->class_year,
                            'academic_status' => $request->academic_status,
                            'semester' => $request->semester,
                            'advisor_id' => $request->advisor_id,
                            'gpa' => $request->gpa,
                        ]);
                        break;
                }
            } else {
                // Update existing profile based on role
                switch ($newRole) {
                    case 'admin':
                        if ($user->adminProfile) {
                            $user->adminProfile->update([
                                'employee_id' => $request->employee_id,
                                'department' => $request->department,
                                'position' => $request->position,
                                'employment_status' => $request->employment_status,
                                'join_date' => $request->join_date,
                                'phone_number' => $request->phone_number,
                                'address' => $request->address,
                                'supervisor_name' => $request->supervisor_name,
                                'work_location' => $request->work_location,
                            ]);
                        } else {
                            $user->adminProfile()->create([
                                'employee_id' => $request->employee_id,
                                'department' => $request->department,
                                'position' => $request->position,
                                'employment_status' => $request->employment_status,
                                'join_date' => $request->join_date,
                                'phone_number' => $request->phone_number,
                                'address' => $request->address,
                                'supervisor_name' => $request->supervisor_name,
                                'work_location' => $request->work_location,
                            ]);
                        }
                        break;
                    case 'dosen':
                        if ($user->dosenProfile) {
                            $user->dosenProfile->update([
                                'employee_number' => $request->employee_number,
                                'expertise' => $request->expertise,
                                'last_education' => $request->last_education,
                                'academic_position' => $request->academic_position,
                                'employment_status' => $request->employment_status,
                                'teaching_start_year' => (int) $request->teaching_start_year,
                            ]);
                        } else {
                            $user->dosenProfile()->create([
                                'employee_number' => $request->employee_number,
                                'expertise' => $request->expertise,
                                'last_education' => $request->last_education,
                                'academic_position' => $request->academic_position,
                                'employment_status' => $request->employment_status,
                                'teaching_start_year' => (int) $request->teaching_start_year,
                            ]);
                        }
                        break;
                    case 'mahasiswa':
                        if ($user->mahasiswaProfile) {
                            $user->mahasiswaProfile->update([
                                'student_number' => $request->student_number,
                                'study_program' => $request->study_program,
                                'class_year' => (int) $request->class_year,
                                'academic_status' => $request->academic_status,
                                'semester' => $request->semester,
                                'advisor_id' => $request->advisor_id,
                                'gpa' => $request->gpa,
                            ]);
                        } else {
                            $user->mahasiswaProfile()->create([
                                'student_number' => $request->student_number,
                                'study_program' => $request->study_program,
                                'class_year' => (int) $request->class_year,
                                'academic_status' => $request->academic_status,
                                'semester' => $request->semester,
                                'advisor_id' => $request->advisor_id,
                                'gpa' => $request->gpa,
                            ]);
                        }
                        break;
                }
            }

            DB::commit();

            return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('User update failed: '.$e->getMessage());
            Log::error('Request data: '.json_encode($request->all()));
            Log::error('Stack trace: '.$e->getTraceAsString());

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal memperbarui pengguna. '.$e->getMessage()]);
        }
    }

    public function destroy(User $user)
    {
        try {
            DB::beginTransaction();

            // Delete related profile
            if ($user->hasRole('admin')) {
                $user->adminProfile?->delete();
            } elseif ($user->hasRole('dosen')) {
                $user->dosenProfile?->delete();
            } elseif ($user->hasRole('mahasiswa')) {
                $user->mahasiswaProfile?->delete();
            }

            $user->delete();

            DB::commit();

            return back()->with('success', 'Pengguna berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Gagal menghapus pengguna. '.$e->getMessage()]);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            DB::beginTransaction();

            $userIds = $request->input('ids', []);

            // Get users with their roles
            $users = User::with('roles')->whereIn('id', $userIds)->get();

            foreach ($users as $user) {
                // Delete related profile based on role
                if ($user->hasRole('admin')) {
                    $user->adminProfile?->delete();
                } elseif ($user->hasRole('dosen')) {
                    $user->dosenProfile?->delete();
                } elseif ($user->hasRole('mahasiswa')) {
                    $user->mahasiswaProfile?->delete();
                }

                // Delete the user
                $user->delete();
            }

            DB::commit();

            return back()->with('success', count($userIds).' pengguna berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Bulk user deletion failed: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal menghapus pengguna. '.$e->getMessage()]);
        }
    }
}
