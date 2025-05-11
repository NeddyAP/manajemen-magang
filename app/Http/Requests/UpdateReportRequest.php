<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest; // Required for Rule::in

class UpdateReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow updates if the user owns the report and it's in an editable state
        // This logic might be better placed in a Policy
        $report = $this->route('report'); // Assumes route model binding for 'report'
        if (! $report) {
            return false;
        }

        return $this->user()->can('update', $report);
        // For a simpler start, similar to StoreReportRequest:
        // return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            // 'report_type', 'content', 'report_date' do not exist in the migration
            'report_file' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:2048'], // Nullable for updates without file change
        ];
    }
}
