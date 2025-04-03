<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    /** @use HasFactory<\Database\Factories\ReportFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'internship_id',
        'title',
        'report_file',
        'version',
        'status',
        'reviewer_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
