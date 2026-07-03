<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactInfo extends Model
{
    protected $table = 'contact__infos';

    protected $fillable = [
        'title',
        'title_kh',
        'bio',
        'bio_kh',
        'status'
    ];
}
