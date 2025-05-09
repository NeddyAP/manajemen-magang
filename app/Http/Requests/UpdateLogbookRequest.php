<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLogbookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization logic should ensure the user owns the logbook
        // or has permission to edit it. This can be done via a Policy.
        // For now, basic check: user is authenticated and logbook exists.
        // The controller should verify ownership.
        $logbook = $this->route('logbook');

        return $this->user() && $logbook && $this->user()->can('update', $logbook);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activities' => ['required', 'string', 'min:3'],
            'date' => ['required', 'date_format:Y-m-d'],
            'supervisor_notes' => ['nullable', 'string', 'max:255'],
            // Add other rules for fields like 'supervisor_notes' if they are part of the update form
            // and need validation.
        ];
    }
}
