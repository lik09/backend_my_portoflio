<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact_Info extends Model
{
    protected $fillable = [
        'title',
        'title_kh',
        'bio',
        'bio_kh',
        'status'
    ];
}
