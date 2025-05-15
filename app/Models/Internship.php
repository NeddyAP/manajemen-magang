<?php

namespace App\Models;

use App\Services\InternshipCompletion;
use Database\Factories\InternshipFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Internship extends Model
{
    /** @use HasFactory<InternshipFactory> */
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

    protected $appends = [
        'progress_percentage',
        'completion_status',
    ];

    protected function completionStatus(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(get: function () {
            return app(InternshipCompletion::class)->checkStatus($this);
        });
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

    protected function progressPercentage(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(get: function () {
            return $this->progress * 100 / 100;
        });
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'progress' => 'integer',
        ];
    }
}
