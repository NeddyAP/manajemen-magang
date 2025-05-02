<?php

namespace App\Notifications\Reports;

use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReportStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public Report $report;

    /**
     * Create a new notification instance.
     */
    public function __construct(Report $report)
    {
        $this->report = $report;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     * The notifiable entity is the Student (Mahasiswa) whose report status changed.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $reportTitle = $this->report->title;
        $statusText = match ($this->report->status) {
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            default => 'diperbarui', // Fallback
        };

        return [
            'message' => "Laporan magang Anda '{$reportTitle}' telah {$statusText}.", // Indonesian text
            'link' => route('front.internships.reports.index', ['internship' => $this->report->internship_id]), // Corrected route name
            'report_id' => $this->report->id,
            'internship_id' => $this->report->internship_id,
            'status' => $this->report->status,
        ];
    }
}
