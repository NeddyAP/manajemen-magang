<?php

namespace App\Notifications\Logbook;

use App\Models\Logbook;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class EntrySubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public Logbook $logbook;

    public User $student;

    /**
     * Create a new notification instance.
     */
    public function __construct(Logbook $logbook)
    {
        $this->logbook = $logbook;
        $this->student = $logbook->internship->user; // Assuming nested relationship exists
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
        $logDate = $this->logbook->date->format('d M Y'); // Format date

        return [
            'message' => "{$studentName} mengirimkan logbook untuk tanggal {$logDate}.", // Indonesian text
            // Link to the logbook index page, filtered by internship_id
            'link' => route('front.logbooks.index').'?internship_id='.$this->logbook->internship_id,
            'logbook_id' => $this->logbook->id,
            'internship_id' => $this->logbook->internship_id,
            'student_id' => $this->student->id,
            'student_name' => $studentName,
        ];
    }
}
