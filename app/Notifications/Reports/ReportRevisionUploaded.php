<?php

namespace App\Notifications\Reports;

use App\Models\Report;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReportRevisionUploaded extends Notification implements ShouldQueue
{
    use Queueable;

    public Report $report;

    public User $dosen;

    /**
     * Create a new notification instance.
     */
    public function __construct(Report $report, User $dosen)
    {
        $this->report = $report;
        $this->dosen = $dosen;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail']; // Add other channels as needed, e.g., 'mail'
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $reportUrl = route('front.internships.reports.index', $this->report->internship_id); // Adjust route as needed

        return (new MailMessage)
            ->subject('Revisi Laporan Magang Telah Diunggah')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Dosen '.$this->dosen->name.' telah mengunggah revisi untuk laporan magang Anda yang berjudul \"'.$this->report->title.'\".')
            ->line('Silakan periksa revisi tersebut pada sistem.')
            ->action('Lihat Laporan', $reportUrl)
            ->line('Terima kasih.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'report_id' => $this->report->id,
            'report_title' => $this->report->title,
            'internship_id' => $this->report->internship_id,
            'dosen_id' => $this->dosen->id,
            'dosen_name' => $this->dosen->name,
            'message' => 'Dosen '.$this->dosen->name.' telah mengunggah revisi untuk laporan Anda: '.$this->report->title,
            'url' => route('front.internships.reports.index', $this->report->internship_id), // Adjust if a more specific URL is available
        ];
    }
}
