<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Talks extends Model
{
    protected $fillable = [
        'title',
        'title_kh',
        'description',
        'description_kh',
        'status'
    ];
}
