<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFaqRequest extends FormRequest
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
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
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
            'question.required' => 'Pertanyaan harus diisi.',
            'question.string' => 'Pertanyaan harus berupa string.',
            'question.max' => 'Pertanyaan maksimal 255 karakter.',
            'answer.required' => 'Jawaban harus diisi.',
            'answer.string' => 'Jawaban harus berupa string.',
            'category.string' => 'Kategori harus berupa string.',
            'category.max' => 'Kategori maksimal 255 karakter.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
            'order.integer' => 'Urutan harus berupa integer.',
            'order.min' => 'Urutan minimal 0.',
        ];
    }
}
