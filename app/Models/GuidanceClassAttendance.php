<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Facades\DB;

class GuidanceClassAttendance extends Pivot
{
    protected $table = 'guidance_class_attendance';

    protected $fillable = [
        'guidance_class_id',
        'user_id',
        'attended_at',
        'attendance_method',
        'notes',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    /**
     * Get the guidance class that owns the attendance record.
     */
    public function guidanceClass(): BelongsTo
    {
        return $this->belongsTo(GuidanceClass::class);
    }

    /**
     * Get the user that owns the attendance record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->with('mahasiswaProfile');
    }

    /**
     * Mark attendance for a student.
     */
    public function markAttended(string $method = 'manual', ?string $notes = null): void
    {
        if ($this->canAttend()) {
            $this->attended_at = now();
            $this->attendance_method = $method;
            $this->notes = $notes;
            $this->save();
        } else {
            throw new \Exception('Student is not eligible to attend this class.');
        }
    }

    /**
     * Check if attendance has been marked.
     */
    public function isAttended(): bool
    {
        return $this->attended_at !== null;
    }

    /**
     * Check if the student can attend the class.
     */
    public function canAttend(): bool
    {
        // For manually marking attendance, we'll be more lenient
        if ($this->attendance_method === 'manual') {
            return true;
        }

        // Make case-insensitive check for 'active' status
        $isActive = strtolower($this->user->mahasiswaProfile->academic_status) === 'active' ||
                   strtolower($this->user->mahasiswaProfile->academic_status) === 'aktif';

        return $this->user->mahasiswaProfile->advisor_id === $this->guidanceClass->lecturer_id
            && $isActive
            && $this->user->internships()
                ->whereIn('status', ['waiting', 'accepted'])
                ->exists();
    }

    /**
     * Scope query to get only eligible students' attendance.
     */
    public function scopeEligible($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->whereHas('mahasiswaProfile', function ($q) {
                $q->where('academic_status', 'Aktif');
            })->whereHas('internships', function ($q) {
                $q->where('status', 'accepted');
            });
        });
    }

    /**
     * Get attendance statistics for a guidance class.
     */
    public static function getClassStats($guidanceClassId)
    {
        return static::where('guidance_class_id', $guidanceClassId)
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(attended_at) as attended'),
                DB::raw('COUNT(*) - COUNT(attended_at) as not_attended'),
            ])
            ->first();
    }
}
