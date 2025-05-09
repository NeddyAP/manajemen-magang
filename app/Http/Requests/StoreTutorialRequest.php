<?php

namespace App\Http\Requests;

use App\Enums\TutorialAccessLevelEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTutorialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['superadmin', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file_name' => 'required|string|max:255',
            'file_path' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar|max:10240',
            'access_level' => ['required', 'string', Rule::in(array_column(TutorialAccessLevelEnum::cases(), 'value'))],
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul harus diisi.',
            'title.string' => 'Judul harus berupa string.',
            'title.max' => 'Judul maksimal 255 karakter.',
            'content.required' => 'Konten harus diisi.',
            'content.string' => 'Konten harus berupa string.',
            'file_name.required' => 'Nama file harus diisi.',
            'file_name.string' => 'Nama file harus berupa string.',
            'file_name.max' => 'Nama file maksimal 255 karakter.',
            'file_path.required' => 'File harus diunggah.',
            'file_path.file' => 'File harus berupa file.',
            'file_path.mimes' => 'File harus berformat: pdf, doc, docx, ppt, pptx, xls, xlsx, zip, rar.',
            'file_path.max' => 'Ukuran file maksimal 10MB.',
            'access_level.required' => 'Level akses harus diisi.',
            'access_level.string' => 'Level akses harus berupa string.',
            'access_level.in' => 'Level akses harus salah satu dari: all, dosen, mahasiswa.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
        ];
    }
}
