<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'fullname',
        'fullname_kh',
        'bio',
        'bio_kh',
        'connect_with_me',
        'status',
        'cv',
        'cv_original_name',
        'photo_cover',
    ];

   
    protected $casts = [
        'connect_with_me' => 'array',
     
    ];
}
