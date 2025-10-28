<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'fullname',
        'bio',
        'connect_with_me',
        'status',
        'cv',
        'cv_original_name',
        'photo_cover',
        // 'user_id' // Uncomment if you added user relationship
    ];

   
    protected $casts = [
        'connect_with_me' => 'array',
     
    ];
}
