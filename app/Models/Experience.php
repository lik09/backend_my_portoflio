<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
     protected $fillable = [
        'title',
        'title_kh',
        'icon',
        'company_name',
        'company_name_kh',
        'start_year',
        'end_year',
        'location',
        'location_kh',
        'emp_type',
        'emp_type_kh',
        'description',
        'description_kh',
        'technologies',
        'key_achievements',
        'key_achievements_kh',
        'status'
    ];

    protected $casts = [
        'technologies' => 'array',
        'key_achievements' => 'array',
        'key_achievements_kh' => 'array',
    ];
}
