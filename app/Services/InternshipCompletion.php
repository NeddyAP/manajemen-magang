<?php

namespace App\Services;

use App\Models\Internship;
use Carbon\Carbon;

class InternshipCompletion
{
    public function checkStatus(Internship $internship): string
    {
        // Check if internship has ended
        if (Carbon::parse($internship->end_date)->isFuture()) {
            return 'Sedang Berlangsung';
        }

        // Check if report is approved
        $hasApprovedReport = $internship->reports()
            ->where('status', 'approved')
            ->exists();

        if (! $hasApprovedReport) {
            return 'Menunggu Persetujuan Laporan';
        }

        // Check if logbooks exist for each day
        $start = Carbon::parse($internship->start_date);
        $end = Carbon::parse($internship->end_date);
        $totalDays = $end->diffInDays($start) + 1;

        $logbookCount = $internship->logbooks()
            ->whereBetween('date', [$start, $end])
            ->count();

        if ($logbookCount < $totalDays) {
            return 'Logbook Belum Lengkap';
        }

        return 'Selesai';
    }
}
