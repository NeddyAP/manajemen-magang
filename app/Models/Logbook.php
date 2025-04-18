<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Logbook extends Model
{
    /** @use HasFactory<\Database\Factories\LogbookFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'internship_id',
        'date',
        'activities',
        'supervisor_notes',
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
