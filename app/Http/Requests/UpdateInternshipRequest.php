<?php

namespace App\Http\Requests;

use App\Enums\InternshipTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInternshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user is authorized to update this internship
        // The internship model is route-model bound, so it's available as $this->internship
        return auth()->check() &&
            auth()->user()->id === $this->internship->user_id &&
            $this->internship->status !== 'accepted';
        // Removed role check as it's implied by the route/controller context for front-end updates by owner.
        // If other roles (e.g. admin) could use this form request via a different route,
        // then role checking or policy-based authorization would be more appropriate.
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(array_column(InternshipTypeEnum::cases(), 'value'))],
            'application_file' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'spp_payment_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'kkl_kkn_payment_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'practicum_payment_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
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
            'spp_payment_file' => 'Bukti Pembayaran SPP',
            'kkl_kkn_payment_file' => 'Bukti Pembayaran KKL/KKN',
            'practicum_payment_file' => 'Bukti Pembayaran Praktikum',
        ];
    }
}
