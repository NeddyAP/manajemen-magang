<?php

namespace App\Notifications\Internship;

use App\Models\Internship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ApplicationSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public Internship $internship;

    public User $applicant;

    /**
     * Create a new notification instance.
     */
    public function __construct(Internship $internship)
    {
        $this->internship = $internship;
        $this->applicant = $internship->user; // Assuming relationship exists
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
     * The notifiable entity is the Admin/Dosen receiving the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $applicantName = $this->applicant->name; // Or profile name if available
        $internshipType = strtoupper($this->internship->type); // KKL or KKN

        return [
            'message' => "Pengajuan {$internshipType} baru oleh {$applicantName}.", // Indonesian text
            'link' => route('admin.internships.edit', $this->internship->id), // Corrected: Link to admin edit page
            'internship_id' => $this->internship->id,
            'applicant_id' => $this->applicant->id,
            'applicant_name' => $applicantName,
        ];
    }
}
