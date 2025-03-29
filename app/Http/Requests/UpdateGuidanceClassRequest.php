<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuidanceClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'lecturer_id' => ['required', 'exists:users,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'room' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'title' => 'Judul',
            'lecturer_id' => 'Dosen',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
            'room' => 'Ruangan',
            'description' => 'Deskripsi',
            'max_participants' => 'Maksimal Peserta',
        ];
    }
}
