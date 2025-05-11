<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreReportRevisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the authenticated user is a Dosen
        // More specific authorization (e.g., is this Dosen allowed to revise this specific report)
        // might be handled by a Policy or in the controller.
        // Corrected: Use hasRole() method for role checking
        return Auth::check() && Auth::user()->hasRole('dosen');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'revised_file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,zip,rar', // Allowed file types
                'max:5120', // Maximum file size in kilobytes (e.g., 5MB)
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'revised_file.required' => 'Berkas revisi laporan wajib diunggah.',
            'revised_file.file' => 'Item yang diunggah harus berupa berkas.',
            'revised_file.mimes' => 'Berkas revisi laporan harus berformat: pdf, doc, docx, zip, rar.',
            'revised_file.max' => 'Ukuran berkas revisi laporan tidak boleh melebihi 5MB.',
        ];
    }
}
