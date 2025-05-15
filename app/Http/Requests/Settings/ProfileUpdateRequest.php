<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], // Max 2MB
        ];

        // Add role-specific validation rules
        if ($user->hasRole('admin') || $user->hasRole('superadmin')) {
            $rules = array_merge($rules, [
                'employee_id' => ['required', 'string', 'max:255', Rule::unique('admin_profiles')->ignore($user->id, 'user_id')],
                'department' => ['required', 'string', 'max:255'],
                'position' => ['required', 'string', 'max:255'],
                'employment_status' => ['required', 'string', Rule::in(['Tetap', 'Kontrak', 'Magang'])],
                'join_date' => ['required', 'date'],
                'phone_number' => ['required', 'string', 'max:255'],
                'address' => ['required', 'string', 'max:255'],
                'supervisor_name' => ['required', 'string', 'max:255'],
                'work_location' => ['required', 'string', 'max:255'],
            ]);
        } elseif ($user->hasRole('dosen')) {
            $rules = array_merge($rules, [
                'employee_number' => ['required', 'string', 'max:255', Rule::unique('dosen_profiles')->ignore($user->id, 'user_id')],
                'expertise' => ['required', 'string', 'max:255'],
                'last_education' => ['required', 'string', 'max:255'],
                'academic_position' => ['required', 'string', 'max:255'],
                'employment_status' => ['required', 'string', Rule::in(['PNS', 'Non-PNS'])],
                'teaching_start_year' => ['required', 'integer', 'min:1900', 'max:'.date('Y')],
            ]);
        } elseif ($user->hasRole('mahasiswa')) {
            $rules = array_merge($rules, [
                'student_number' => ['required', 'string', 'max:255', Rule::unique('mahasiswa_profiles')->ignore($user->id, 'user_id')],
                'study_program' => ['required', 'string', 'max:255'],
                'class_year' => ['required', 'integer', 'min:1900', 'max:'.(date('Y') + 4)],
                'academic_status' => ['required', 'string', Rule::in(['Aktif', 'Cuti', 'Lulus'])],
                'semester' => ['required', 'integer', 'min:1', 'max:14'],
                'advisor_id' => ['nullable', 'exists:users,id'],
                'gpa' => ['nullable', 'numeric', 'min:0', 'max:4'],
            ]);
        }

        return $rules;
    }
}
