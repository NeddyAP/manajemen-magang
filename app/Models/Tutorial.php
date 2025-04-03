<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tutorial extends Model
{
    /** @use HasFactory<\Database\Factories\TutorialFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'file_name',
        'file_path',
        'access_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
