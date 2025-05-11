<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLogbookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated user associated with an internship can create a logbook.
        // More specific authorization can be handled in the controller or a policy.
        return auth()->check() && auth()->user()->hasRole('mahasiswa') && $this->route('internship');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activities' => ['required', 'string', 'min:3'],
            'date' => ['required', 'date_format:Y-m-d'],
            // Add other rules for fields like 'supervisor_notes' if they are part of the creation form
            // and need validation. For now, assuming only 'kegiatan' and 'date' are primary.
        ];
    }
}
