<?php

namespace App\Notifications\Internship;

use App\Models\Internship;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public Internship $internship;

    /**
     * Create a new notification instance.
     */
    public function __construct(Internship $internship)
    {
        $this->internship = $internship;
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
     * The notifiable entity is the Student (Mahasiswa) whose application status changed.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = ucfirst($this->internship->status); // e.g., Accepted, Rejected
        $internshipType = strtoupper($this->internship->type); // KKL or KKN
        $company = $this->internship->company_name;
        $statusText = match ($this->internship->status) {
            'accepted' => 'diterima',
            'rejected' => 'ditolak',
            default => 'diperbarui', // Fallback, though should be accepted/rejected
        };

        return [
            'message' => "Pengajuan {$internshipType} Anda untuk {$company} telah {$statusText}.", // Indonesian text
            'link' => route('front.internships.applicants.index'), // Changed: Link to student applicant index page
            'internship_id' => $this->internship->id,
            'status' => $this->internship->status,
        ];
    }
}
