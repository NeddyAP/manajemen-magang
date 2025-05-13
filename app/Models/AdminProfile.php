<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdminProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'department',
        'position',
        'employment_status',
        'join_date',
        'phone_number',
        'address',
        'supervisor_name',
        'work_location',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    protected function casts(): array
    {
        return [
            'join_date' => 'date',
        ];
    }
}
