<?php

namespace App\Models;

use Database\Factories\GlobalVariableFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GlobalVariable extends Model
{
    /** @use HasFactory<GlobalVariableFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'key',
        'slug',
        'value',
        'description',
        'type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
