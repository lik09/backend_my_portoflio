<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillInfo extends Model
{
    protected $table = 'skill__infos';

    protected $fillable = [
        'title', 'title_kh', 'bio', 'bio_kh', 'status'
    ];
}
