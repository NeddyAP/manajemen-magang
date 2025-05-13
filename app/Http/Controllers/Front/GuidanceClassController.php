<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use App\Notifications\GuidanceClass\ClassScheduled;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Inertia\Response;

class GuidanceClassController extends Controller
{
    /**
     * Display a listing of guidance classes.
     *
     * @return Response
     */
    public function index(Request $request)
    {
        // Load user with roles to avoid duplicate role queries
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        // Base query
        $query = null;

        if ($userRole === 'dosen') {
            // Dosen melihat kelas yang mereka ampu
            $query = GuidanceClass::where('lecturer_id', $user->id)
                ->with(['lecturer.dosenProfile', 'students' => function ($query): void {
                    $query->with('internships', function ($query): void {
                        $query->where('status', 'accepted')
                            ->latest()
                            ->first();
                    });
                }]);
        } elseif ($userRole === 'mahasiswa') {
            // Mahasiswa melihat kelas dari dosen pembimbing mereka
            if ($user->mahasiswaProfile && $user->mahasiswaProfile->advisor_id) {
                $query = GuidanceClass::where('lecturer_id', $user->mahasiswaProfile->advisor_id)
                    ->with(['lecturer.dosenProfile', 'students' => function ($query) use ($user): void {
                        $query->where('users.id', $user->id)
                            ->with('internships', function ($query): void {
                                $query->where('status', 'accepted')
                                    ->latest()
                                    ->first();
                            });
                    }]);
            } else {
                $query = GuidanceClass::where('id', 0); // Empty query
            }
        } else {
            $query = GuidanceClass::where('id', 0); // Empty query
        }

        // Clone the base query for analytics before applying filters/search
        $analyticsQuery = clone $query;

        // Handle search with more comprehensive capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            // Use a more efficient search with a cleaner approach
            $query->where(function ($q) use ($searchTerm, $userRole): void {
                // Search in guidance class fields
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('room', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");

                // Search in lecturer info
                $q->orWhereHas('lecturer', function ($lecturerQuery) use ($searchTerm): void {
                    $lecturerQuery->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%")
                        ->orWhereHas('dosenProfile', function ($profileQuery) use ($searchTerm): void {
                            $profileQuery->where('employee_number', 'like', "%{$searchTerm}%")
                                ->orWhere('expertise', 'like', "%{$searchTerm}%")
                                ->orWhere('academic_position', 'like', "%{$searchTerm}%");
                        });
                });

                // Search by student name if the user is a dosen
                if ($userRole === 'dosen') {
                    $q->orWhereHas('students', function ($studentQuery) use ($searchTerm): void {
                        $studentQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('email', 'like', "%{$searchTerm}%")
                            ->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($searchTerm): void {
                                $profileQuery->where('student_number', 'like', "%{$searchTerm}%")
                                    ->orWhere('study_program', 'like', "%{$searchTerm}%");
                            });
                    });
                }

                // Search by date if the search term is a valid date format
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(start_date) = ?', [$searchTerm])
                            ->orWhereRaw('YEAR(end_date) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(start_date, '%Y-%m') = ?", [$searchTerm])
                            ->orWhereRaw("DATE_FORMAT(end_date, '%Y-%m') = ?", [$searchTerm]);
                    }
                }

                // Try to parse as a date string and search
                try {
                    $date = Carbon::parse($searchTerm);
                    $formattedDate = $date->format('Y-m-d');
                    $q->orWhereDate('start_date', $formattedDate)
                        ->orWhereDate('end_date', $formattedDate);
                } catch (Exception $e) {
                    // Not a valid date format, skip this search condition
                }
            });
        }

        // Handle filters with improved status handling
        if ($request->has('filter')) {
            $now = now();
            foreach ($request->filter as $column => $value) {
                if ($column === 'status' && $value) {
                    switch ($value) {
                        case 'upcoming':
                            $query->where('start_date', '>', $now);
                            break;
                        case 'ongoing':
                            $query->where('start_date', '<=', $now)
                                ->where(function ($q) use ($now): void {
                                    $q->whereNull('end_date')
                                        ->orWhere('end_date', '>=', $now);
                                });
                            break;
                        case 'finished':
                            $query->whereNotNull('end_date')
                                ->where('end_date', '<', $now);
                            break;
                    }
                } elseif (! empty($value)) {
                    // Apply default 'like' filter for other columns
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        } elseif ($request->has('status')) {
            // Handle direct status parameter for simpler filtering
            $now = now();
            $status = $request->status;

            switch ($status) {
                case 'upcoming':
                    $query->where('start_date', '>', $now);
                    break;
                case 'ongoing':
                    $query->where('start_date', '<=', $now)
                        ->where(function ($q) use ($now): void {
                            $q->whereNull('end_date')
                                ->orWhere('end_date', '>=', $now);
                        });
                    break;
                case 'finished':
                    $query->whereNotNull('end_date')
                        ->where('end_date', '<', $now);
                    break;
            }
        }

        // Handle sorting with improved field mapping
        if ($request->has('sort_field')) {
            $sortField = $request->sort_field;
            $direction = $request->input('sort_direction', 'asc');

            // Map frontend field names to database field names
            $sortMapping = [
                'title' => 'title',
                'start_date' => 'start_date',
                'end_date' => 'end_date',
                'room' => 'room',
                'lecturer' => 'lecturer_id',
                'created_at' => 'created_at',
                'updated_at' => 'updated_at',
            ];

            if (isset($sortMapping[$sortField])) {
                $dbField = $sortMapping[$sortField];
                $query->orderBy($dbField, $direction);
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        // Calculate analytics using the cloned query, removing any previous ordering
        $now = now();
        $guidanceClassStats = $analyticsQuery
            ->reorder() // Remove existing order by clauses
            ->select(
                DB::raw('count(*) as total'),
                DB::raw("sum(case when start_date > '{$now}' then 1 else 0 end) as upcoming"),
                DB::raw("sum(case when start_date <= '{$now}' and (end_date is null or end_date >= '{$now}') then 1 else 0 end) as ongoing"),
                DB::raw("sum(case when end_date is not null and end_date < '{$now}' then 1 else 0 end) as finished")
            )
            ->first();

        // Paginate the results with user-defined page size
        $perPage = $request->input('per_page', 10);
        $classes = $query->paginate($perPage)->withQueryString();

        return Inertia::render('front/internships/guidance-classes/index', [
            'classes' => $classes->items(),
            'guidanceClassStats' => $guidanceClassStats, // Pass stats to the view
            'meta' => [
                'total' => $classes->total(),
                'per_page' => $classes->perPage(),
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
                'from' => $classes->firstItem(),
                'to' => $classes->lastItem(),
                'links' => $classes->linkCollection()->toArray(),
            ],
            'filters' => $request->only(['search', 'filter', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new guidance class.
     *
     * @return Response
     */
    public function create()
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat membuat kelas bimbingan.');
        }

        return Inertia::render('front/internships/guidance-classes/create');
    }

    /**
     * Store a newly created guidance class in storage.
     *
     * @return RedirectResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat membuat kelas bimbingan.');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'room' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $guidanceClass = new GuidanceClass;
        $guidanceClass->title = $request->title;
        $guidanceClass->lecturer_id = $user->id;
        $guidanceClass->start_date = $request->start_date;
        $guidanceClass->end_date = $request->end_date;
        $guidanceClass->room = $request->room;
        $guidanceClass->description = $request->description;
        $guidanceClass->save();

        // Notify eligible students
        try {
            $eligibleStudents = $guidanceClass->getEligibleStudents();
            if ($eligibleStudents->isNotEmpty()) {
                Notification::send($eligibleStudents, new ClassScheduled($guidanceClass));
            }
        } catch (Exception $e) {
            // Log error if notification sending fails, but don't block the user
            Log::error('Failed to send ClassScheduled notification', ['error' => $e->getMessage(), 'class_id' => $guidanceClass->id]);
        }

        return redirect()->route('front.internships.guidance-classes.show', $guidanceClass->id)
            ->with('success', 'Kelas bimbingan berhasil dibuat.');
    }

    /**
     * Display the specified guidance class.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id, Request $request)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name === 'dosen' ? 'dosen' : 'mahasiswa';

        $guidanceClass = GuidanceClass::with([
            'lecturer' => function ($query): void {
                $query->with('dosenProfile');
            },
        ])->findOrFail($id);

        abort_if($userRole === 'dosen' && $guidanceClass->lecturer_id !== $user->id, 403, 'Anda tidak memiliki akses ke kelas bimbingan ini.');

        abort_if($userRole === 'mahasiswa' &&
        (! $user->mahasiswaProfile || $user->mahasiswaProfile->advisor_id !== $guidanceClass->lecturer_id), 403, 'Anda tidak memiliki akses ke kelas bimbingan ini.');

        // Get eligible students (those advised by this lecturer and with accepted internships)
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
                'guidanceClassAttendance' => function ($query) use ($guidanceClass): void { // Corrected from 'attendances'
                    $query->where('guidance_class_id', $guidanceClass->id);
                },
            ]);

        // Enhanced search for students within the class
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            $query->where(function ($q) use ($searchTerm, $guidanceClass): void {
                // Search in user fields
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%");

                // Search in mahasiswaProfile fields with more comprehensive options
                $q->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($searchTerm): void {
                    $profileQuery->where('student_number', 'like', "%{$searchTerm}%")
                        ->orWhere('study_program', 'like', "%{$searchTerm}%")
                        ->orWhere('semester', 'like', "%{$searchTerm}%")
                        ->orWhere('phone', 'like', "%{$searchTerm}%");
                });

                // Search in internships with more fields
                $q->orWhereHas('internships', function ($internshipQuery) use ($searchTerm): void {
                    $internshipQuery->where('company_name', 'like', "%{$searchTerm}%")
                        ->orWhere('position', 'like', "%{$searchTerm}%")
                        ->orWhere('department', 'like', "%{$searchTerm}%")
                        ->orWhere('status', 'like', "%{$searchTerm}%");
                });

                // Search by attendance status with localized terms
                if (strtolower($searchTerm) === 'hadir' || strtolower($searchTerm) === 'present') {
                    $q->orWhereHas('guidanceClassAttendance', function ($attendanceQuery) use ($guidanceClass): void {
                        $attendanceQuery->where('guidance_class_id', $guidanceClass->id)
                            ->whereNotNull('attended_at');
                    });
                } elseif (
                    strtolower($searchTerm) === 'tidak hadir' || strtolower($searchTerm) === 'absent' ||
                    strtolower($searchTerm) === 'belum hadir' || strtolower($searchTerm) === 'not present'
                ) {
                    $q->orWhereHas('guidanceClassAttendance', function ($attendanceQuery) use ($guidanceClass): void {
                        $attendanceQuery->where('guidance_class_id', $guidanceClass->id)
                            ->whereNull('attended_at');
                    });
                }
            });
        }

        // Handle filters
        if ($request->has('filter')) {
            foreach ($request->filter as $field => $value) {
                if (! empty($value)) {
                    if ($field === 'attendance.status') {
                        if ($value === 'present') {
                            $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass): void {
                                $q->where('guidance_class_id', $guidanceClass->id)
                                    ->whereNotNull('attended_at');
                            });
                        } elseif ($value === 'absent') {
                            $query->whereHas('guidanceClassAttendance', function ($q) use ($guidanceClass): void {
                                $q->where('guidance_class_id', $guidanceClass->id)
                                    ->whereNull('attended_at');
                            });
                        }
                    } elseif (strpos($field, '.') !== false) {
                        // Handle related fields like 'mahasiswaProfile.study_program'
                        [$relation, $column] = explode('.', $field);
                        $query->whereHas($relation, function ($q) use ($column, $value): void {
                            $q->where($column, 'like', "%{$value}%");
                        });
                    } else {
                        $query->where($field, 'like', "%{$value}%");
                    }
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
                'email' => 'email',
                'student_number' => 'mahasiswaProfile.student_number',
                'study_program' => 'mahasiswaProfile.study_program',
                'semester' => 'mahasiswaProfile.semester',
                'created_at' => 'created_at',
                'updated_at' => 'updated_at',
            ];

            if (isset($sortMapping[$sortField])) {
                if (strpos($sortMapping[$sortField], '.') !== false) {
                    // Handle sorting for related fields
                    [$relation, $column] = explode('.', $sortMapping[$sortField]);

                    if ($relation === 'mahasiswaProfile') {
                        $query->join('mahasiswa_profiles', 'users.id', '=', 'mahasiswa_profiles.user_id')
                            ->orderBy("mahasiswa_profiles.{$column}", $sortDirection)
                            ->select('users.*'); // Ensure we only get users table
                    }
                } else {
                    $query->orderBy($sortField, $sortDirection);
                }
            } else {
                $query->orderBy('name', 'asc');
            }
        } else {
            $query->orderBy('name', 'asc');
        }

        // Apply pagination if requested, otherwise get all students
        if ($request->has('per_page')) {
            $perPage = $request->input('per_page', 10);
            $studentsData = $query->paginate($perPage);
            $students = $studentsData->through(function ($student) use ($id) {
                return $this->formatStudentData($student, $id);
            });

            $meta = [
                'total' => $studentsData->total(),
                'current_page' => $studentsData->currentPage(),
                'last_page' => $studentsData->lastPage(),
                'per_page' => $studentsData->perPage(),
                'from' => $studentsData->firstItem(),
                'to' => $studentsData->lastItem(),
            ];
        } else {
            // Get all students for non-paginated view
            $studentsCollection = $query->get();
            $students = $studentsCollection->map(function ($student) use ($id) {
                return $this->formatStudentData($student, $id);
            });

            $meta = null;
        }

        // Check if student has attended
        $isAttended = false;
        if ($userRole === 'mahasiswa') {
            $attendance = GuidanceClassAttendance::where('guidance_class_id', $id)
                ->where('user_id', $user->id)
                ->first();

            $isAttended = $attendance && $attendance->attended_at !== null;
        }

        // Prepare the class data
        $classData = [
            'id' => $guidanceClass->id,
            'title' => $guidanceClass->title,
            'room' => $guidanceClass->room,
            'description' => $guidanceClass->description,
            'start_date' => $guidanceClass->start_date,
            'end_date' => $guidanceClass->end_date,
            'qr_code' => $guidanceClass->qr_code,
            'lecturer' => [
                'id' => $guidanceClass->lecturer->id,
                'name' => $guidanceClass->lecturer->name,
                'employee_number' => $guidanceClass->lecturer->dosenProfile->employee_number ?? null,
                'expertise' => $guidanceClass->lecturer->dosenProfile->expertise ?? null,
                'academic_position' => $guidanceClass->lecturer->dosenProfile->academic_position ?? null,
            ],
            'students' => $students instanceof LengthAwarePaginator
                ? $students->items()
                : $students, // Handle both paginated and non-paginated results
        ];

        return Inertia::render('front/internships/guidance-classes/show', [
            'class' => $classData,
            'userRole' => $userRole,
            'isAttended' => $isAttended,
            'meta' => $meta,
            'filters' => $request->only(['search', 'filter', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Format student data for response
     */
    private function formatStudentData(User $student, int $guidanceClassId): array
    {
        // Access attendance record with specific guidance class ID
        $attendance = GuidanceClassAttendance::where('guidance_class_id', $guidanceClassId)
            ->where('user_id', $student->id)
            ->first();
        $internship = $student->internships->first();

        return [
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'student_number' => $student->mahasiswaProfile?->student_number,
            'study_program' => $student->mahasiswaProfile?->study_program,
            'semester' => $student->mahasiswaProfile?->semester,
            'internship' => [
                'company_name' => $internship?->company_name,
                'position' => $internship?->position,
                'department' => $internship?->department,
                'status' => $internship?->status,
            ],
            'attendance' => [
                'attended_at' => $attendance?->attended_at,
                'attendance_method' => $attendance?->attendance_method,
                'notes' => $attendance?->notes,
            ],
        ];
    }

    /**
     * Show the form for editing the specified guidance class.
     *
     * @param  int  $id
     * @return Response
     */
    public function edit($id)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat mengedit kelas bimbingan.');
        }

        $guidanceClass = GuidanceClass::with('lecturer')->findOrFail($id);

        if ($guidanceClass->lecturer_id !== $user->id) {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Anda hanya dapat mengedit kelas bimbingan yang Anda buat.');
        }

        return Inertia::render('front/internships/guidance-classes/edit', [
            'guidanceClass' => $guidanceClass,
        ]);
    }

    /**
     * Update the specified guidance class in storage.
     *
     * @param  int  $id
     * @return RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat mengedit kelas bimbingan.');
        }

        $guidanceClass = GuidanceClass::findOrFail($id);

        if ($guidanceClass->lecturer_id !== $user->id) {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Anda hanya dapat mengedit kelas bimbingan yang Anda buat.');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:5|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'room' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $guidanceClass->title = $request->title;
        $guidanceClass->start_date = $request->start_date;
        $guidanceClass->end_date = $request->end_date;
        $guidanceClass->room = $request->room;
        $guidanceClass->description = $request->description;
        $guidanceClass->save();

        return redirect()->route('front.internships.guidance-classes.show', $guidanceClass->id)
            ->with('success', 'Kelas bimbingan berhasil diperbarui.');
    }

    /**
     * Generate QR code for attendance.
     *
     * @param  int  $id
     * @return RedirectResponse
     */
    public function generateQrCode($id)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat membuat QR Code kehadiran.');
        }

        $guidanceClass = GuidanceClass::findOrFail($id);

        if ($guidanceClass->lecturer_id !== $user->id) {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Anda hanya dapat membuat QR Code untuk kelas bimbingan yang Anda buat.');
        }

        // Generate a unique token for this QR code
        $token = Str::random(20);

        // Set the QR code URL with the token
        $qrCodeUrl = route('guidance-classes.attend', ['token' => $token]);
        $guidanceClass->qr_code = $qrCodeUrl;
        $guidanceClass->save();

        return back()->with('success', 'QR Code kehadiran berhasil dibuat.');
    }

    /**
     * Mark student attendance manually for dosen.
     *
     * @param  int  $classId
     * @param  int  $studentId
     * @return RedirectResponse
     */
    public function markAttendance(Request $request, $classId, $studentId)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return back()->with('error', 'Hanya dosen yang dapat menandai kehadiran secara manual.');
        }

        $guidanceClass = GuidanceClass::where('id', $classId)
            ->where('lecturer_id', $user->id)
            ->firstOrFail();

        $attendance = GuidanceClassAttendance::where('guidance_class_id', $classId)
            ->where('user_id', $studentId)
            ->first();

        if (! $attendance) {
            // Create attendance record if it doesn't exist
            $attendance = new GuidanceClassAttendance([
                'guidance_class_id' => $classId,
                'user_id' => $studentId,
            ]);
        }

        if ($attendance->attended_at) {
            return back()->with('error', 'Mahasiswa ini sudah ditandai hadir.');
        }

        // Get notes from request or use default
        $notes = $request->input('notes', 'Ditandai secara manual oleh dosen.');

        try {
            // When dosen manually marks attendance, use syncWithoutDetaching to ensure pivot data is saved properly
            if ($attendance->id) {
                // Update existing record
                $attendance->attended_at = now();
                $attendance->attendance_method = 'manual';
                $attendance->notes = $notes;
                $attendance->save();
            } else {
                // Create a new record via sync
                $guidanceClass->students()->syncWithoutDetaching([
                    $studentId => [
                        'attended_at' => now(),
                        'attendance_method' => 'manual',
                        'notes' => $notes,
                    ],
                ]);
            }

            return back()->with('success', 'Kehadiran mahasiswa berhasil dicatat.'); // Revert to redirect
        } catch (Exception $e) {
            // Still return back with error on exception
            return back()->with('error', 'Gagal mencatat kehadiran: '.$e->getMessage());
        }
    }

    /**
     * Reset attendance for a student.
     *
     * @param  int  $classId
     * @param  int  $studentId
     * @return RedirectResponse
     */
    public function resetAttendance($classId, $studentId)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return back()->with('error', 'Hanya dosen yang dapat mereset kehadiran.');
        }

        $guidanceClass = GuidanceClass::where('id', $classId)
            ->where('lecturer_id', $user->id)
            ->firstOrFail();

        // Delete the record directly using query builder
        $deleted = GuidanceClassAttendance::where('guidance_class_id', $classId)
            ->where('user_id', $studentId)
            ->delete(); // Returns the number of affected rows

        // Even if $deleted is 0 (e.g., already deleted), the state is correct
        return back()->with('success', 'Kehadiran mahasiswa berhasil dihapus.');
    }

    /**
     * Remove the specified guidance class from storage.
     *
     * @param  int  $id
     * @return RedirectResponse
     */
    public function destroy($id)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name ?? null;

        if ($userRole !== 'dosen') {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Hanya dosen yang dapat menghapus kelas bimbingan.');
        }

        $guidanceClass = GuidanceClass::findOrFail($id);

        if ($guidanceClass->lecturer_id !== $user->id) {
            return redirect()->route('front.internships.guidance-classes.index')
                ->with('error', 'Anda hanya dapat menghapus kelas bimbingan yang Anda buat.');
        }

        // Delete related attendances
        GuidanceClassAttendance::where('guidance_class_id', $id)->delete();

        // Delete the class
        $guidanceClass->delete();

        return redirect()->route('front.internships.guidance-classes.index')
            ->with('success', 'Kelas bimbingan berhasil dihapus.');
    }
}
