<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user is authorized to update this internship
        // return auth()->check() &&
        //        auth()->user()->role === 'mahasiswa' &&
        //        $this->internship->user_id === auth()->id() &&
        //        $this->internship->status === 'waiting';
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:kkl,kkn'],
            'application_file' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'Tipe Magang',
            'application_file' => 'Berkas Lamaran',
            'company_name' => 'Nama Perusahaan/Instansi',
            'company_address' => 'Alamat Perusahaan/Instansi',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
        ];
    }
}
