<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GlobalVariable extends Model
{
    /** @use HasFactory<\Database\Factories\GlobalVariableFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'key',
        'slug',
        'value',
        'description',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
