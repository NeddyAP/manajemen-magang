<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlobalVariable extends Model
{
    /** @use HasFactory<\Database\Factories\GlobalVariableFactory> */
    use HasFactory;

    protected $fillable = [
        'key',
        'slug',
        'value',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
