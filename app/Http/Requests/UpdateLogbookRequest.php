<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLogbookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $logbook = $this->route('logbook');
        $user = $this->user();

        if (!$user || !$logbook) {
            return false;
        }

        // Check if user is a dosen
        if ($user->hasRole('dosen')) {
            // Use the specific policy method for dosen
            return $user->can('updateSupervisorNotes', $logbook);
        }

        // For other users, check regular update permission
        return $user->can('update', $logbook);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        // If user is a dosen who can only update supervisor_notes
        if ($user->hasRole('dosen')) {
            return [
                'supervisor_notes' => ['nullable', 'string', 'max:255'],
            ];
        }

        // For other users with full edit permissions
        return [
            'activities' => ['required', 'string', 'min:3'],
            'date' => ['required', 'date_format:Y-m-d'],
            'supervisor_notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
