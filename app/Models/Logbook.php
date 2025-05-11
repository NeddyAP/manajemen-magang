<?php

namespace App\Models;

use Database\Factories\LogbookFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Logbook extends Model
{
    /** @use HasFactory<LogbookFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'internship_id',
        'user_id',
        'date',
        'activities',
        'supervisor_notes',
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
