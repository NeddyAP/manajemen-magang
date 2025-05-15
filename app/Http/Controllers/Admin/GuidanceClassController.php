<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuidanceClassRequest;
use App\Http\Requests\UpdateGuidanceClassRequest;
use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use App\Notifications\GuidanceClass\ClassScheduled;
use DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Log;

class GuidanceClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = GuidanceClass::with(['lecturer.dosenProfile'])
            ->latest();

        // Handle search with more comprehensive capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            // Use a more efficient search with a cleaner approach
            $query->where(function ($q) use ($searchTerm): void {
                // Search in guidance class fields
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('room', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('description', 'LIKE', "%{$searchTerm}%");

                // Search in related lecturer data
                $q->orWhereHas('lecturer', function ($userQuery) use ($searchTerm): void {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                        ->orWhereHas('dosenProfile', function ($profileQuery) use ($searchTerm): void {
                            $profileQuery->where('employee_number', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('expertise', 'LIKE', "%{$searchTerm}%")
                                ->orWhere('academic_position', 'LIKE', "%{$searchTerm}%");
                        });
                });

                // Search by month/year in dates
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(start_date) = ?', [$searchTerm])
                            ->orWhereRaw('YEAR(end_date) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(start_date, '%Y-%m') = ?", [$searchTerm])
                            ->orWhereRaw("DATE_FORMAT(end_date, '%Y-%m') = ?", [$searchTerm]);
                    }
                }
            });
        }

        // Handle filters if present
        if ($request->has('filter')) {
            foreach ($request->filter as $column => $value) {
                if (! empty($value)) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        // Handle sorting with advanced options
        if ($request->has('sort_field')) {
            $sortField = $request->sort_field;
            $direction = $request->input('sort_direction', 'asc');

            // Special handling for related fields
            if ($sortField === 'lecturer') {
                $query->join('users', 'guidance_classes.lecturer_id', '=', 'users.id')
                    ->orderBy('users.name', $direction)
                    ->select('guidance_classes.*');
            } else {
                $query->orderBy($sortField, $direction);
            }
        } else {
            $query->latest('created_at');
        }

        // Paginate the results with user-defined page size
        $perPage = $request->input('per_page', 10);
        $classes = $query->paginate($perPage)
            ->withQueryString()
            ->through(fn ($class) => [
                'id' => $class->id,
                'title' => $class->title,
                'lecturer' => $class->lecturer ? [
                    'id' => $class->lecturer->id,
                    'name' => $class->lecturer->name,
                    'employee_number' => $class->lecturer->dosenProfile->employee_number ?? null,
                    'expertise' => $class->lecturer->dosenProfile->expertise ?? null,
                    'academic_position' => $class->lecturer->dosenProfile->academic_position ?? null,
                ] : [
                    'id' => null,
                    'name' => 'N/A', // Or some other placeholder
                    'employee_number' => null,
                    'expertise' => null,
                    'academic_position' => null,
                ],
                'start_date' => $class->start_date,
                'end_date' => $class->end_date,
                'room' => $class->room,
                'participants_count' => $class->students()->count(),
            ]);

        $lecturers = User::role('dosen')
            ->with('dosenProfile')
            ->get()
            ->map(fn ($lecturer) => [
                'id' => $lecturer->id,
                'name' => $lecturer->name,
                'employee_number' => $lecturer->dosenProfile->employee_number ?? null,
                'expertise' => $lecturer->dosenProfile->expertise ?? null,
                'academic_position' => $lecturer->dosenProfile->academic_position ?? null,
            ]);

        return inertia('admin/guidance-classes/index', [
            'classes' => $classes->items(),
            'lecturers' => $lecturers,
            'meta' => [
                'total' => $classes->total(),
                'currentPage' => $classes->currentPage(),
                'lastPage' => $classes->lastPage(),
                'perPage' => $classes->perPage(),
                'from' => $classes->firstItem(),
                'to' => $classes->lastItem(),
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

            // Find eligible students and attach them to the guidance class
            $eligibleStudents = User::role('mahasiswa')
                ->whereHas('mahasiswaProfile', function ($query) use ($guidanceClass): void {
                    $query->where('advisor_id', $guidanceClass->lecturer_id)
                        ->where('academic_status', 'Aktif');
                })
                ->whereHas('internships', function ($query): void {
                    $query->where('status', 'accepted');
                })
                ->get();

            // Directly using DB query to insert records rather than relying on model events or the attendance model
            foreach ($eligibleStudents as $student) {
                DB::table('guidance_class_attendance')->insert([
                    'guidance_class_id' => $guidanceClass->id,
                    'user_id' => $student->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Notify students after attaching them
            if ($eligibleStudents->isNotEmpty()) {
                Notification::send($eligibleStudents, new ClassScheduled($guidanceClass));
            }

            return redirect()
                ->route('admin.guidance-classes.index')
                ->with('success', 'Kelas bimbingan berhasil dibuat dan presensi mahasiswa telah disiapkan.');
        } catch (Exception $e) {
            // Log the exception for debugging
            Log::error('Error creating guidance class: '.$e->getMessage(), ['exception' => $e]);

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
            ->whereHas('mahasiswaProfile', function ($query) use ($guidanceClass): void {
                $query->where('advisor_id', $guidanceClass->lecturer_id)
                    ->where('academic_status', 'Aktif');
            })
            ->with([
                'mahasiswaProfile',
                'internships' => function ($query): void {
                    $query->where('status', 'accepted')
                        ->latest();
                },
            ]);

        // Add more comprehensive search functionality
        if ($search = $request->input('search')) {
            $searchTerm = trim($search);

            $query->where(function ($q) use ($searchTerm, $guidanceClass): void {
                // Search in user fields
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%");

                // Search in mahasiswaProfile fields
                $q->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($searchTerm): void {
                    $profileQuery->where('student_number', 'like', "%{$searchTerm}%")
                        ->orWhere('study_program', 'like', "%{$searchTerm}%")
                        ->orWhere('semester', $searchTerm)
                        ->orWhere('semester', 'like', "%{$searchTerm}%");
                });

                // Search in internship fields
                $q->orWhereHas('internships', function ($internshipQuery) use ($searchTerm): void {
                    $internshipQuery->where('company_name', 'like', "%{$searchTerm}%")
                        ->orWhere('status', 'like', "%{$searchTerm}%");
                });

                // Search by attendance status
                if (strtolower($searchTerm) === 'hadir' || strtolower($searchTerm) === 'present') {
                    $q->orWhereHas('guidanceClassAttendance', function ($attendanceQuery) use ($guidanceClass): void {
                        $attendanceQuery->where('guidance_class_id', $guidanceClass->id)
                            ->whereNotNull('attended_at');
                    });
                } elseif (strtolower($searchTerm) === 'tidak hadir' || strtolower($searchTerm) === 'absent') {
                    $q->orWhereHas('guidanceClassAttendance', function ($attendanceQuery) use ($guidanceClass): void {
                        $attendanceQuery->where('guidance_class_id', $guidanceClass->id)
                            ->whereNull('attended_at');
                    });
                }
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
                    $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass): void {
                        $q->where('guidance_class_id', $guidanceClass->id)
                            ->whereNotNull('attended_at');
                    });
                } elseif ($attendanceQuery === 'belum_hadir') {
                    // Filter for students who are not present (attended_at is null)
                    $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass): void {
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
            ->through(function ($student) use ($guidanceClass) {
                // Access attendance record with specific guidance class ID
                $attendance = GuidanceClassAttendance::where('guidance_class_id', $guidanceClass->id)
                    ->where('user_id', $student->id)
                    ->first();
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
            'lecturer' => $guidanceClass->lecturer ? [
                'id' => $guidanceClass->lecturer->id,
                'name' => $guidanceClass->lecturer->name,
                'academic_position' => $guidanceClass->lecturer->dosenProfile->academic_position ?? null,
            ] : [
                'id' => null,
                'name' => 'N/A', // Or some other placeholder
                'academic_position' => null,
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

        // Notify students associated with this class
        $studentsToNotify = $guidanceClass->students()->get();
        if ($studentsToNotify->isNotEmpty()) {
            Notification::send($studentsToNotify, new ClassScheduled($guidanceClass));
        }

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
