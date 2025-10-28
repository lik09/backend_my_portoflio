<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Connect_Me extends Model
{
    protected $fillable = [
        'name',
        'name_kh',
        'connection',
        'description',
        'description_kh',
        'icon_name',
        'icon_import',
        'bg_box',
        'status'
    ];
}
