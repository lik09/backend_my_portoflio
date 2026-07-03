<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectInfo extends Model
{
    protected $table = 'project__infos';

    protected  $fillable = ['title', 'title_kh', 'bio', 'bio_kh', 'status'];


    
}
