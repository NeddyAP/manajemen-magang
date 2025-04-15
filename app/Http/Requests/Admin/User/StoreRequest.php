<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Basic user validation rules that apply to all roles
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'string', Rule::in(['admin', 'dosen', 'mahasiswa'])],
        ];

        // Get the selected role
        $selectedRole = $this->input('roles.0');

        // Add role-specific validation rules based on the selected role
        if ($selectedRole === 'admin') {
            $rules = array_merge($rules, [
                'employee_id' => ['required', 'string', 'max:255', 'unique:admin_profiles'],
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
                'employee_number' => ['required', 'string', 'max:255', 'unique:dosen_profiles'],
                'expertise' => ['required', 'string', 'max:255'],
                'last_education' => ['required', 'string', 'max:255'],
                'academic_position' => ['required', 'string', 'max:255'],
                'employment_status' => ['required', 'string', Rule::in(['PNS', 'Non-PNS'])],
                'teaching_start_year' => ['required', 'integer', 'min:1970', 'max:'.date('Y')],
            ]);
        } elseif ($selectedRole === 'mahasiswa') {
            $rules = array_merge($rules, [
                'student_number' => ['required', 'string', 'max:255', 'unique:mahasiswa_profiles'],
                'study_program' => ['required', 'string', 'max:255'],
                'class_year' => ['required', 'integer', 'min:1970', 'max:'.date('Y')],
                'academic_status' => ['required', 'string', Rule::in(['Aktif', 'Cuti', 'Lulus'])],
                'semester' => ['required', 'integer', 'min:1', 'max:14'],
                'advisor_id' => ['nullable', 'exists:users,id'],
                'gpa' => ['nullable', 'numeric', 'min:0', 'max:4'],
            ]);
        }

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $messages = [
            'name.required' => 'Nama harus diisi.',
            'name.string' => 'Nama harus berupa string.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'email.required' => 'Email harus diisi.',
            'email.string' => 'Email harus berupa string.',
            'email.email' => 'Email harus valid.',
            'email.max' => 'Email maksimal 255 karakter.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password harus diisi.',
            'password.string' => 'Password harus berupa string.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'roles.required' => 'Role harus diisi.',
            'roles.array' => 'Role harus berupa array.',
            'roles.min' => 'Role minimal 1.',
            'roles.*.required' => 'Setiap role harus diisi.',
            'roles.*.string' => 'Setiap role harus berupa string.',
            'roles.*.in' => 'Role tidak valid.',
        ];

        // Get the selected role
        $selectedRole = $this->input('roles.0');

        if ($selectedRole === 'admin') {
            $messages = array_merge($messages, [
                'employee_id.required' => 'ID Karyawan harus diisi.',
                'employee_id.string' => 'ID Karyawan harus berupa string.',
                'employee_id.max' => 'ID Karyawan maksimal 255 karakter.',
                'employee_id.unique' => 'ID Karyawan sudah terdaftar.',
                'department.required' => 'Departemen harus diisi.',
                'department.string' => 'Departemen harus berupa string.',
                'department.max' => 'Departemen maksimal 255 karakter.',
                'position.required' => 'Posisi harus diisi.',
                'position.string' => 'Posisi harus berupa string.',
                'position.max' => 'Posisi maksimal 255 karakter.',
                'employment_status.required' => 'Status Kepegawaian harus diisi.',
                'employment_status.string' => 'Status Kepegawaian harus berupa string.',
                'employment_status.in' => 'Status Kepegawaian tidak valid.',
                'join_date.required' => 'Tanggal Bergabung harus diisi.',
                'join_date.date' => 'Tanggal Bergabung harus berupa tanggal.',
                'phone_number.string' => 'Nomor Telepon harus berupa string.',
                'phone_number.max' => 'Nomor Telepon maksimal 20 karakter.',
                'address.string' => 'Alamat harus berupa string.',
                'address.max' => 'Alamat maksimal 255 karakter.',
                'supervisor_name.string' => 'Nama Supervisor harus berupa string.',
                'supervisor_name.max' => 'Nama Supervisor maksimal 255 karakter.',
                'work_location.required' => 'Lokasi Kerja harus diisi.',
                'work_location.string' => 'Lokasi Kerja harus berupa string.',
                'work_location.max' => 'Lokasi Kerja maksimal 255 karakter.',
            ]);
        } elseif ($selectedRole === 'dosen') {
            $messages = array_merge($messages, [
                'employee_number.required' => 'Nomor Induk Pegawai harus diisi.',
                'employee_number.string' => 'Nomor Induk Pegawai harus berupa string.',
                'employee_number.max' => 'Nomor Induk Pegawai maksimal 255 karakter.',
                'employee_number.unique' => 'Nomor Induk Pegawai sudah terdaftar.',
                'expertise.required' => 'Keahlian harus diisi.',
                'expertise.string' => 'Keahlian harus berupa string.',
                'expertise.max' => 'Keahlian maksimal 255 karakter.',
                'last_education.required' => 'Pendidikan Terakhir harus diisi.',
                'last_education.string' => 'Pendidikan Terakhir harus berupa string.',
                'last_education.max' => 'Pendidikan Terakhir maksimal 255 karakter.',
                'academic_position.required' => 'Jabatan Akademik harus diisi.',
                'academic_position.string' => 'Jabatan Akademik harus berupa string.',
                'academic_position.max' => 'Jabatan Akademik maksimal 255 karakter.',
                'employment_status.required' => 'Status Kepegawaian harus diisi.',
                'employment_status.string' => 'Status Kepegawaian harus berupa string.',
                'employment_status.in' => 'Status Kepegawaian tidak valid.',
                'teaching_start_year.required' => 'Tahun Mulai Mengajar harus diisi.',
                'teaching_start_year.integer' => 'Tahun Mulai Mengajar harus berupa angka tahun.',
                'teaching_start_year.min' => 'Tahun Mulai Mengajar minimal 1970.',
                'teaching_start_year.max' => 'Tahun Mulai Mengajar tidak boleh melebihi tahun ini.',
            ]);
        } elseif ($selectedRole === 'mahasiswa') {
            $messages = array_merge($messages, [
                'student_number.required' => 'Nomor Induk Mahasiswa harus diisi.',
                'student_number.string' => 'Nomor Induk Mahasiswa harus berupa string.',
                'student_number.max' => 'Nomor Induk Mahasiswa maksimal 255 karakter.',
                'student_number.unique' => 'Nomor Induk Mahasiswa sudah terdaftar.',
                'study_program.required' => 'Program Studi harus diisi.',
                'study_program.string' => 'Program Studi harus berupa string.',
                'study_program.max' => 'Program Studi maksimal 255 karakter.',
                'class_year.required' => 'Tahun Angkatan harus diisi.',
                'class_year.integer' => 'Tahun Angkatan harus berupa angka tahun.',
                'class_year.min' => 'Tahun Angkatan minimal 1970.',
                'class_year.max' => 'Tahun Angkatan tidak boleh melebihi tahun ini.',
                'academic_status.required' => 'Status Akademik harus diisi.',
                'academic_status.string' => 'Status Akademik harus berupa string.',
                'academic_status.in' => 'Status Akademik tidak valid.',
                'semester.required' => 'Semester harus diisi.',
                'semester.integer' => 'Semester harus berupa integer.',
                'semester.min' => 'Semester minimal 1.',
                'semester.max' => 'Semester maksimal 14.',
                'advisor_id.exists' => 'Dosen Pembimbing tidak valid.',
                'gpa.numeric' => 'IPK harus berupa angka.',
                'gpa.min' => 'IPK minimal 0.',
                'gpa.max' => 'IPK maksimal 4.',
            ]);
        }

        return $messages;
    }
}
