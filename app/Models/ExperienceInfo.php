<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExperienceInfo extends Model
{
    protected $table = 'experience__infos';

    protected  $fillable = ['title', 'title_kh', 'bio', 'bio_kh', 'status'];
}
