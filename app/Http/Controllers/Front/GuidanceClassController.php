<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\User;
use App\Notifications\GuidanceClass\ClassScheduled;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ->with(['lecturer', 'students' => function ($query): void {
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
                    ->with(['lecturer', 'students' => function ($query) use ($user): void {
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

        // Handle search
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm): void {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('room', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('lecturer', function ($subQuery) use ($searchTerm): void {
                        $subQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Handle filters
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
                } elseif ($value) {
                    // Apply default 'like' filter for other columns
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        // Handle sorting
        if ($request->has('sort_field')) {
            $direction = $request->input('sort_direction', 'asc');
            $query->orderBy($request->sort_field, $direction);
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

        // Paginate the results (using the potentially filtered/searched query)
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
    public function show($id)
    {
        $user = Auth::user()->load('roles');
        $userRole = $user->roles->first()->name === 'dosen' ? 'dosen' : 'mahasiswa';

        $guidanceClass = GuidanceClass::with([
            'lecturer' => function ($query): void {
                $query->with('dosenProfile');
            },
        ])->findOrFail($id);

        // Check if user is authorized to view this class
        if ($userRole === 'dosen' && $guidanceClass->lecturer_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kelas bimbingan ini.');
        }

        if (
            $userRole === 'mahasiswa' &&
            (! $user->mahasiswaProfile || $user->mahasiswaProfile->advisor_id !== $guidanceClass->lecturer_id)
        ) {
            abort(403, 'Anda tidak memiliki akses ke kelas bimbingan ini.');
        }

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
            ]);

        $students = $query->get()->map(function ($student) use ($id) {
            // Access relationships directly from User model
            $attendance = GuidanceClassAttendance::where('guidance_class_id', $id)
                ->where('user_id', $student->id)
                ->first();
            $internship = $student->internships->first();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'student_number' => $student->mahasiswaProfile?->student_number,
                'study_program' => $student->mahasiswaProfile?->study_program,
                'semester' => $student->mahasiswaProfile?->semester,
                'internship' => [
                    'company_name' => $internship?->company_name,
                    'status' => $internship?->status,
                ],
                'attendance' => [
                    'attended_at' => $attendance?->attended_at,
                    'attendance_method' => $attendance?->attendance_method,
                    'notes' => $attendance?->notes,
                ],
            ];
        });

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
            'students' => $students, // Pass the full collection
        ];

        return Inertia::render('front/internships/guidance-classes/show', [
            'class' => $classData,
            'userRole' => $userRole,
            'isAttended' => $isAttended,
        ]);
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
            // When dosen manually marks attendance, directly update the record
            $attendance->attended_at = now();
            $attendance->attendance_method = 'manual';
            $attendance->notes = $notes;
            $attendance->save();

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
