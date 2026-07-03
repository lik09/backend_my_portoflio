<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationInfo extends Model
{
    protected $table = 'education__infos';

    protected $fillable = [
        'title',
        'title_kh',
        'bio',
        'bio_kh',
        'status'
    ];
}
