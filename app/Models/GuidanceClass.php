<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class GuidanceClass extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'lecturer_id',
        'start_date',
        'end_date',
        'room',
        'description',
        'qr_code',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lecturer_id')
            ->whereHas('roles', fn ($query) => $query->where('name', 'dosen'))
            ->with('dosenProfile');
    }

    public function students(): BelongsToMany
    {
        // Capture lecturer_id to ensure it's correctly scoped in the closure
        $lecturerId = $this->lecturer_id;

        return $this->belongsToMany(User::class, 'guidance_class_attendance')
            ->whereHas('roles', fn ($query) => $query->where('name', 'mahasiswa'))
            ->whereHas('mahasiswaProfile', function ($query) use ($lecturerId): void {
                $query->where('advisor_id', $lecturerId)
                    ->where('academic_status', 'Aktif');
            })
            ->whereHas('internships', function ($query): void {
                $query->where('status', 'accepted');
            })
            ->with(['mahasiswaProfile', 'internships' => function ($query): void {
                $query->where('status', 'accepted')
                    ->latest();
            }])
            ->withPivot(['attended_at', 'attendance_method', 'notes'])
            ->withTimestamps();
    }

    public function getEligibleStudents()
    {
        $lecturerId = $this->lecturer_id; // Capture lecturer_id

        return User::role('mahasiswa')
            ->whereHas('mahasiswaProfile', function ($query) use ($lecturerId): void { // Use captured variable
                $query->where('advisor_id', $lecturerId)
                    ->where('academic_status', 'Aktif');
            })
            ->whereHas('internships', function ($query): void {
                $query->where('status', 'accepted');
            })
            ->get();
    }

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

    public function isStudentEligible(User $student): bool
    {
        return $student->hasRole('mahasiswa')
            && $student->mahasiswaProfile
            && $student->mahasiswaProfile->advisor_id === $this->lecturer_id
            && $student->mahasiswaProfile->academic_status === 'Aktif'
            && $student->internships()
                ->where('status', 'accepted')
                ->exists();
    }

    public function attendedStudents(): BelongsToMany
    {
        return $this->students()->whereNotNull('guidance_class_attendance.attended_at');
    }

    public function generateQrCode(): void
    {
        // TODO: Implement QR code generation
        $this->qr_code = 'generated_qr_code_here';
        $this->save();
    }

    public function hasAvailableSpots(): bool
    {
        return true;
    }

    public function isOngoing(): bool
    {
        $now = now();

        return $this->start_date <= $now && (! $this->end_date || $this->end_date >= $now);
    }

    public function getAttendanceStats()
    {
        return GuidanceClassAttendance::getClassStats($this->id);
    }

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

    public static function getStudentClasses($studentId)
    {
        return static::whereHas('students', function ($query) use ($studentId): void {
            $query->where('users.id', $studentId);
        })
            ->with(['lecturer.dosenProfile', 'students' => function ($query) use ($studentId): void {
                $query->where('users.id', $studentId);
            }])
            ->get();
    }
}
