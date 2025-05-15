<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DosenProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_number',
        'expertise',
        'last_education',
        'academic_position',
        'employment_status',
        'teaching_start_year',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the students advised by this lecturer.
     */
    public function advisees()
    {
        return $this->hasMany(MahasiswaProfile::class, 'advisor_id', 'user_id');
    }

    protected function casts(): array
    {
        return [
            'teaching_start_year' => 'integer',
        ];
    }
}
