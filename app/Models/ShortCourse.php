<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShortCourse extends Model
{
    protected $table = 'short__courses';

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
