<?php

namespace App\Notifications\GuidanceClass;

use App\Models\GuidanceClass;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ClassScheduled extends Notification implements ShouldQueue
{
    use Queueable;

    public GuidanceClass $guidanceClass;

    /**
     * Create a new notification instance.
     */
    public function __construct(GuidanceClass $guidanceClass)
    {
        $this->guidanceClass = $guidanceClass;
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
     * The notifiable entity is the Student (Mahasiswa) assigned to the class.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $className = $this->guidanceClass->title;
        $classDateTime = $this->guidanceClass->start_date->format('d M Y H:i'); // Format date and time

        return [
            'message' => "Anda dijadwalkan untuk kelas bimbingan '{$className}' pada {$classDateTime}.", // Indonesian text
            'link' => route('front.guidance-classes.index'), // Link to student's guidance class list
            'guidance_class_id' => $this->guidanceClass->id,
        ];
    }
}
