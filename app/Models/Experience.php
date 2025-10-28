<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
     protected $fillable = [
        'title',
        'icon',
        'company_name',
        'start_year',
        'end_year',
        'location',
        'emp_type',
        'description',
        'technologies',
        'key_achievements',
        'status'
    ];

    protected $casts = [
        'technologies' => 'array',
        'key_achievements' => 'array',
    ];
}
