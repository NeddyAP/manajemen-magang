<?php

namespace App\Notifications\Reports;

use App\Models\Report;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReportSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public Report $report;

    public User $student;

    /**
     * Create a new notification instance.
     */
    public function __construct(Report $report)
    {
        $this->report = $report;
        $this->student = $report->internship->user; // Assuming nested relationship exists
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
     * The notifiable entity is the Supervisor (Dosen).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $studentName = $this->student->name; // Or profile name

        return [
            'message' => "{$studentName} mengirimkan laporan magang.", // Indonesian text
            // Assuming a route exists to view the report or the student's report list
            'link' => route('front.reports.index', ['internship_id' => $this->report->internship_id]), // Adjust route as needed
            'report_id' => $this->report->id,
            'internship_id' => $this->report->internship_id,
            'student_id' => $this->student->id,
            'student_name' => $studentName,
        ];
    }
}
