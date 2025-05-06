<?php

namespace App\Models;

use App\Services\InternshipCompletion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Internship extends Model
{
    /** @use HasFactory<\Database\Factories\InternshipFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'application_file',
        'company_name',
        'company_address',
        'start_date',
        'end_date',
        'status',
        'status_message',
        'progress',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'progress' => 'integer',
    ];

    protected $appends = [
        'progress_percentage',
        'completion_status'
    ];

    public function getCompletionStatusAttribute()
    {
        return app(InternshipCompletion::class)->checkStatus($this);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logbooks()
    {
        return $this->hasMany(Logbook::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function getProgressPercentageAttribute()
    {
        return $this->progress * 100 / 100;
    }
}
