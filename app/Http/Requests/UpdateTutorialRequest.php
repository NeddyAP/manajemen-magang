<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTutorialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'file_name' => 'required|string|max:255',
            'file_path' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar|max:10240',
            'access_level' => 'required|string|in:all,dosen,mahasiswa',
            'is_active' => 'boolean',
        ];
    }
}
