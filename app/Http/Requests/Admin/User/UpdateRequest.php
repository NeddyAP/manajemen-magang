<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Basic user validation rules
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', Rule::in(['admin', 'dosen', 'mahasiswa'])],
        ];

        // Get the selected role
        $selectedRole = $this->input('roles.0');

        // Add role-specific validation rules based on the selected role
        if ($selectedRole === 'admin') {
            $rules = array_merge($rules, [
                'employee_id' => ['required', 'string', 'max:255', Rule::unique('admin_profiles')->ignore($this->user->id, 'user_id')],
                'department' => ['required', 'string', 'max:255'],
                'position' => ['required', 'string', 'max:255'],
                'employment_status' => ['required', 'string', Rule::in(['Tetap', 'Kontrak', 'Magang'])],
                'join_date' => ['required', 'date'],
                'phone_number' => ['nullable', 'string', 'max:20'],
                'address' => ['nullable', 'string', 'max:255'],
                'supervisor_name' => ['nullable', 'string', 'max:255'],
                'work_location' => ['required', 'string', 'max:255'],
            ]);
        } elseif ($selectedRole === 'dosen') {
            $rules = array_merge($rules, [
                'employee_number' => ['required', 'string', 'max:255', Rule::unique('dosen_profiles')->ignore($this->user->id, 'user_id')],
                'expertise' => ['required', 'string', 'max:255'],
                'last_education' => ['required', 'string', 'max:255'],
                'academic_position' => ['required', 'string', 'max:255'],
                'employment_status' => ['required', 'string', Rule::in(['PNS', 'Non-PNS'])],
                'teaching_start_year' => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            ]);
        } elseif ($selectedRole === 'mahasiswa') {
            $rules = array_merge($rules, [
                'student_number' => ['required', 'string', 'max:255', Rule::unique('mahasiswa_profiles')->ignore($this->user->id, 'user_id')],
                'study_program' => ['required', 'string', 'max:255'],
                'class_year' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 4)],
                'academic_status' => ['required', 'string', Rule::in(['Aktif', 'Cuti', 'Lulus'])],
                'semester' => ['required', 'integer', 'min:1', 'max:14'],
                'advisor_id' => ['nullable', 'exists:users,id'],
                'gpa' => ['nullable', 'numeric', 'min:0', 'max:4'],
            ]);
        }

        return $rules;
    }
} 