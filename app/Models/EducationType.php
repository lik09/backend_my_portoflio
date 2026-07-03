<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationType extends Model
{
    protected $table = 'education__types';

    protected $fillable = [
        'name',
        'name_kh',
        'status'
    ];

    public function schools()
    {
        return $this->hasMany(HighSchool::class, 'edu_type_id');
    }
}
