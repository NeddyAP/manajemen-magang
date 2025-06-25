<?php

namespace App\Http\Requests;

use App\Enums\InternshipTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInternshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole('mahasiswa');
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
            'application_file' => ['required', 'file', 'mimes:pdf', 'max:2048'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'spp_payment_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'kkl_kkn_payment_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'practicum_payment_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
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
