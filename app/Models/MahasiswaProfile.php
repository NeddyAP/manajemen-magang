<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MahasiswaProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_number',
        'study_program',
        'class_year',
        'academic_status',
        'semester',
        'advisor_id',
        'gpa',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function advisor()
    {
        return $this->belongsTo(User::class, 'advisor_id');
    }

    protected function casts(): array
    {
        return [
            'class_year' => 'integer',
            'semester' => 'integer',
            'gpa' => 'decimal:2',
        ];
    }
}
