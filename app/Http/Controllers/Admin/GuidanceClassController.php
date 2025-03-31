<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuidanceClassRequest;
use App\Http\Requests\UpdateGuidanceClassRequest;
use App\Models\GuidanceClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuidanceClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = GuidanceClass::with(['lecturer'])
            ->latest();
        // Add search functionality
        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhereHas('lecturer', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $classes = $query->paginate(10)
            ->withQueryString()
            ->through(fn ($class) => [
                'id' => $class->id,
                'title' => $class->title,
                'lecturer' => [
                    'id' => $class->lecturer->id,
                    'name' => $class->lecturer->name,
                ],
                'start_date' => $class->start_date,
                'end_date' => $class->end_date,
                'room' => $class->room,
                'participants_count' => $class->students()->count(),
            ]);

        $lecturers = User::role('dosen')->get(['id', 'name']);

        return inertia('admin/guidance-classes/index', [
            'classes' => $classes->items(),
            'lecturers' => $lecturers,
            'meta' => [
                'total' => $classes->total(),
                'currentPage' => $classes->currentPage(),
                'lastPage' => $classes->lastPage(),
                'perPage' => $classes->perPage(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $lecturers = User::role('dosen')->get(['id', 'name']);

        return inertia('admin/guidance-classes/create', [
            'lecturers' => $lecturers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGuidanceClassRequest $request)
    {
        try {
            // Create guidance class
            $guidanceClass = GuidanceClass::create($request->validated());

            // Generate QR Code with token
            $token = Str::random(32);
            $guidanceClass->qr_code = route('guidance-classes.attend', ['token' => $token]);
            $guidanceClass->save();

            // Get all eligible students for this lecturer
            $eligibleStudents = User::role('mahasiswa')
                ->whereHas('mahasiswaProfile', function ($query) use ($guidanceClass) {
                    $query->where('advisor_id', $guidanceClass->lecturer_id)
                        ->where('academic_status', 'Aktif');
                })
                ->whereHas('internships', function ($query) {
                    $query->where('status', 'accepted');
                })
                ->pluck('id')
                ->all();

            // Create attendance records for all eligible students
            foreach ($eligibleStudents as $studentId) {
                $guidanceClass->students()->attach($studentId, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return redirect()
                ->route('admin.guidance-classes.index')
                ->with('success', 'Kelas bimbingan berhasil dibuat dan presensi mahasiswa telah disiapkan.');
        } catch (\Exception $e) {
            return redirect()
                ->route('admin.guidance-classes.index')
                ->with('error', 'Terjadi kesalahan saat membuat kelas bimbingan.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, GuidanceClass $guidanceClass)
    {
        // Load lecturer with profile
        $guidanceClass->load(['lecturer.dosenProfile']);

        // Get eligible students (those advised by this lecturer, active, and have accepted internships)
        $query = User::role('mahasiswa')
            ->whereHas('mahasiswaProfile', function ($query) use ($guidanceClass) {
                $query->where('advisor_id', $guidanceClass->lecturer_id)
                    ->where('academic_status', 'Aktif');
            })
            // Add separate whereHas for internships directly on User
            ->whereHas('internships', function ($query) {
                $query->where('status', 'accepted');
            })
            ->with([
                // Load profile directly
                'mahasiswaProfile',
                // Load internships directly, constrained
                'internships' => function ($query) {
                    $query->where('status', 'accepted')
                        ->latest(); // Keep latest if multiple accepted exist
                },
                // Load attendance directly, constrained
                'guidanceClassAttendance' => function ($query) use ($guidanceClass) {
                    $query->where('guidance_class_id', $guidanceClass->id);
                },
            ]);

        // Add search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('mahasiswaProfile', function ($q) use ($search) {
                        $q->where('student_number', 'like', "%{$search}%");
                    });
            });
        }

        // Handle filters
        if ($request->has('filter')) {
            $filters = $request->filter;

            // Filter by attendance status
            if (isset($filters['attendance.attended_at'])) {
                $attendanceQuery = $filters['attendance.attended_at'];
                if ($attendanceQuery === 'hadir') {
                    // Filter for students who are present (attended_at is not null)
                    $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass) {
                        $q->where('guidance_class_id', $guidanceClass->id)
                            ->whereNotNull('attended_at');
                    });
                } elseif ($attendanceQuery === 'belum_hadir') {
                    // Filter for students who are not present (attended_at is null)
                    $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass) {
                        $q->where('guidance_class_id', $guidanceClass->id)
                            ->whereNull('attended_at');
                    });
                }
            }
        }

        // Handle sorting
        if ($request->has('sort_field')) {
            $sortField = $request->input('sort_field');
            $sortDirection = $request->input('sort_direction', 'asc');

            // Map frontend field names to database field names
            $sortMapping = [
                'name' => 'name',
                'student_number' => 'mahasiswaProfile.student_number',
                'study_program' => 'mahasiswaProfile.study_program',
                'semester' => 'mahasiswaProfile.semester',
            ];

            if (array_key_exists($sortField, $sortMapping)) {
                $dbField = $sortMapping[$sortField];

                // Handle dot notation for relationships
                if (str_contains($dbField, '.')) {
                    [$relation, $field] = explode('.', $dbField);
                    $query->join('mahasiswa_profiles', 'users.id', '=', 'mahasiswa_profiles.user_id')
                        ->orderBy("mahasiswa_profiles.$field", $sortDirection);
                } else {
                    $query->orderBy($sortField, $sortDirection);
                }
            } else {
                $query->orderBy('name', 'asc');
            }
        } else {
            $query->orderBy('name', 'asc');
        }

        // Paginate the students
        $perPage = $request->input('per_page', 10);
        $students = $query->paginate($perPage)
            ->through(function ($student) {
                // Access relationships directly from User model
                $attendance = $student->guidanceClassAttendance->first(); // Access directly
                $internship = $student->internships->first(); // Access directly

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'student_number' => $student->mahasiswaProfile->student_number,
                    'study_program' => $student->mahasiswaProfile->study_program,
                    'semester' => $student->mahasiswaProfile->semester,
                    'internship' => [
                        // Use optional chaining for safety
                        'company_name' => $internship?->company_name,
                        'status' => $internship?->status,
                    ],
                    'attendance' => [
                        // Use optional chaining for safety
                        'attended_at' => $attendance?->attended_at,
                        'attendance_method' => $attendance?->attendance_method,
                        'notes' => $attendance?->notes,
                    ],
                ];
            });

        // Prepare the data structure expected by the frontend ('class' prop containing students)
        $classData = [
            'id' => $guidanceClass->id,
            'title' => $guidanceClass->title,
            'room' => $guidanceClass->room,
            'description' => $guidanceClass->description,
            'start_date' => $guidanceClass->start_date,
            'end_date' => $guidanceClass->end_date,
            'qr_code' => $guidanceClass->qr_code, // Make sure QR code is included
            'lecturer' => [
                'id' => $guidanceClass->lecturer->id,
                'name' => $guidanceClass->lecturer->name,
                'employee_number' => $guidanceClass->lecturer->dosenProfile->employee_number,
                'expertise' => $guidanceClass->lecturer->dosenProfile->expertise,
                'academic_position' => $guidanceClass->lecturer->dosenProfile->academic_position,
            ],
            'students' => $students->items(),
        ];

        // Pass the combined data under the single 'class' key
        return inertia('admin/guidance-classes/show', [
            'class' => $classData,
            'meta' => [
                'total' => $students->total(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GuidanceClass $guidanceClass)
    {
        $lecturers = User::role('dosen')->get(['id', 'name']);

        $guidanceClass->load(['lecturer']);

        return inertia('admin/guidance-classes/edit', [
            'guidanceClass' => $guidanceClass,
            'lecturers' => $lecturers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGuidanceClassRequest $request, GuidanceClass $guidanceClass)
    {
        $guidanceClass->update($request->validated());

        return redirect()
            ->route('admin.guidance-classes.index')
            ->with('success', 'Kelas bimbingan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GuidanceClass $guidanceClass)
    {
        $guidanceClass->delete();

        return redirect()
            ->route('admin.guidance-classes.index')
            ->with('success', 'Kelas bimbingan berhasil dihapus.');
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'exists:guidance_classes,id'],
        ]);

        GuidanceClass::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', 'Kelas bimbingan berhasil dihapus.');
    }
}
