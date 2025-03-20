<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DosenProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_number',
        'expertise',
        'last_education',
        'academic_position',
        'employment_status',
        'teaching_start_year',
    ];

    protected $casts = [
        'teaching_start_year' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
