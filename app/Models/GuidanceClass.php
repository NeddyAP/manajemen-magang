<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class GuidanceClass extends Model
{
    protected $fillable = [
        'title',
        'lecturer_id',
        'start_date',
        'end_date',
        'room',
        'description',
        'qr_code',
        'max_participants',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected static function booted()
    {
        // After a guidance class is created, generate attendance records
        static::created(function ($guidanceClass) {
            $guidanceClass->generateAttendanceRecords();
        });
    }

    /**
     * Get the lecturer that owns the guidance class.
     */
    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id')
            ->whereHas('roles', fn ($query) => $query->where('name', 'dosen'))
            ->with('dosenProfile');
    }

    /**
     * Get the students attending this guidance class.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'guidance_class_attendance')
            ->whereHas('roles', fn ($query) => $query->where('name', 'mahasiswa'))
            ->whereHas('mahasiswaProfile', function ($query) {
                $query->where('advisor_id', $this->lecturer_id)
                    ->where('academic_status', 'active');
            })
            ->whereHas('internships', function ($query) {
                $query->whereIn('status', ['pending', 'active', 'ongoing']);
            })
            ->with(['mahasiswaProfile', 'internships' => function ($query) {
                $query->whereIn('status', ['pending', 'active', 'ongoing'])
                    ->latest();
            }])
            ->withPivot(['attended_at', 'attendance_method', 'notes'])
            ->withTimestamps();
    }

    /**
     * Get all eligible students for this guidance class.
     */
    public function getEligibleStudents()
    {
        return User::role('mahasiswa')
            ->whereHas('mahasiswaProfile', function ($query) {
                $query->where('advisor_id', $this->lecturer_id)
                    ->where('academic_status', 'active');
            })
            ->whereHas('internships', function ($query) {
                $query->whereIn('status', ['pending', 'active', 'ongoing']);
            })
            ->get();
    }

    /**
     * Generate attendance records for all eligible students.
     */
    public function generateAttendanceRecords()
    {
        $eligibleStudents = $this->getEligibleStudents();

        $records = $eligibleStudents->map(function ($student) {
            return [
                'guidance_class_id' => $this->id,
                'user_id' => $student->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })->all();

        if (! empty($records)) {
            DB::table('guidance_class_attendance')->insert($records);
        }
    }

    /**
     * Check if a student is eligible to attend this class.
     */
    public function isStudentEligible(User $student): bool
    {
        return $student->hasRole('mahasiswa')
            && $student->mahasiswaProfile
            && $student->mahasiswaProfile->advisor_id === $this->lecturer_id
            && $student->mahasiswaProfile->academic_status === 'active'
            && $student->internships()
                ->whereIn('status', ['pending', 'active', 'ongoing'])
                ->exists();
    }

    /**
     * Get students who have attended the class.
     */
    public function attendedStudents(): BelongsToMany
    {
        return $this->students()->whereNotNull('guidance_class_attendance.attended_at');
    }

    /**
     * Generate QR code for attendance.
     */
    public function generateQrCode(): void
    {
        // TODO: Implement QR code generation
        $this->qr_code = 'generated_qr_code_here';
        $this->save();
    }

    /**
     * Check if class has available spots.
     */
    public function hasAvailableSpots(): bool
    {
        if (! $this->max_participants) {
            return true;
        }

        return $this->students()->count() < $this->max_participants;
    }

    /**
     * Check if class is ongoing.
     */
    public function isOngoing(): bool
    {
        $now = now();

        return $this->start_date <= $now && (! $this->end_date || $this->end_date >= $now);
    }

    /**
     * Get attendance statistics for this class.
     */
    public function getAttendanceStats()
    {
        return GuidanceClassAttendance::getClassStats($this->id);
    }

    /**
     * Update attendance records when new eligible students are added.
     */
    public function refreshAttendanceRecords()
    {
        $existingStudentIds = DB::table('guidance_class_attendance')
            ->where('guidance_class_id', $this->id)
            ->pluck('user_id');

        $newEligibleStudents = $this->getEligibleStudents()
            ->whereNotIn('id', $existingStudentIds);

        if ($newEligibleStudents->isNotEmpty()) {
            $records = $newEligibleStudents->map(function ($student) {
                return [
                    'guidance_class_id' => $this->id,
                    'user_id' => $student->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->all();

            DB::table('guidance_class_attendance')->insert($records);
        }

        return $newEligibleStudents->count();
    }

    /**
     * Get all classes for a specific student.
     */
    public static function getStudentClasses($studentId)
    {
        return static::whereHas('students', function ($query) use ($studentId) {
            $query->where('users.id', $studentId);
        })
            ->with(['lecturer.dosenProfile', 'students' => function ($query) use ($studentId) {
                $query->where('users.id', $studentId);
            }])
            ->get();
    }
}
