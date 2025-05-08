<?php

namespace App\Http\Controllers;

use App\Models\GuidanceClass;
use Illuminate\Support\Facades\Auth;

class GuidanceClassAttendanceController extends Controller
{
    public function attend($token)
    {
        $user = Auth::user();
        $guidanceClass = GuidanceClass::where('qr_code', route('guidance-classes.attend', ['token' => $token]))
            ->with(['lecturer', 'students'])
            ->firstOrFail();

        // Validate attendance prerequisites
        if (! $guidanceClass->isStudentEligible($user)) {
            if (! $user->hasRole('mahasiswa') || ! $user->mahasiswaProfile) {
                return back()->with('error', 'Hanya mahasiswa yang dapat melakukan absensi.');
            }

            if ($user->mahasiswaProfile->advisor_id !== $guidanceClass->lecturer_id) {
                return back()->with('error', 'Anda tidak terdaftar sebagai mahasiswa bimbingan dosen ini.');
            }

            if ($user->mahasiswaProfile->academic_status !== 'Aktif') {
                return back()->with('error', 'Status akademik Anda tidak aktif.');
            }

            return back()->with('error', 'Anda harus memiliki magang yang aktif atau sedang berjalan untuk menghadiri kelas.');
        }

        // Check if class is ongoing and has spots
        if (! $guidanceClass->isOngoing()) {
            return back()->with('error', 'Kelas bimbingan tidak sedang berlangsung.');
        }

        if (! $guidanceClass->hasAvailableSpots()) {
            return back()->with('error', 'Kelas bimbingan sudah penuh.');
        }

        // Get latest internship for notes
        $internship = $user->internships()
            ->where('status', 'accepted')
            ->latest()
            ->first();

        try {
            // Record attendance
            $attendance = $guidanceClass->students()->syncWithoutDetaching([
                $user->id => [
                    'attended_at' => now(),
                    'attendance_method' => 'qr_code',
                    'notes' => "Semester {$user->mahasiswaProfile->semester} - ".
                        "Magang: {$internship->company_name} ({$internship->status})",
                ],
            ]);

            if (empty($attendance['attached'])) {
                return back()->with('error', 'Anda sudah terdaftar di kelas bimbingan ini.');
            }

            return back()->with('success', 'Kehadiran berhasil dicatat.');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan saat mencatat kehadiran. Silakan coba lagi.');
        }
    }
}
