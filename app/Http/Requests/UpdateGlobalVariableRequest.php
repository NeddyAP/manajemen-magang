<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGlobalVariableRequest extends FormRequest
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
            'key' => 'required|string|max:255|unique:global_variables,key,'.$this->route('global_variable')->id,
            'slug' => 'required|string|max:255|unique:global_variables,slug,'.$this->route('global_variable')->id,
            'value' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
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
            'key.required' => 'Kunci harus diisi.',
            'key.string' => 'Kunci harus berupa string.',
            'key.max' => 'Kunci maksimal 255 karakter.',
            'key.unique' => 'Kunci sudah ada.',
            'slug.required' => 'Slug harus diisi.',
            'slug.string' => 'Slug harus berupa string.',
            'slug.max' => 'Slug maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah ada.',
            'value.required' => 'Nilai harus diisi.',
            'value.string' => 'Nilai harus berupa string.',
            'value.max' => 'Nilai maksimal 255 karakter.',
            'description.string' => 'Deskripsi harus berupa string.',
            'description.max' => 'Deskripsi maksimal 255 karakter.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
        ];
    }
}
