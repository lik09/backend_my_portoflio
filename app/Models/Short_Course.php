<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Short_Course extends Model
{
    protected $fillable = [
        'course_name',
        'course_name_kh',
        'teacher_name',
        'teacher_name_kh',
        'description',
        'description_kh',
        'time_study',
        'mode',  //online or direct
        'status',
    ];
}
