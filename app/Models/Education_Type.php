<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education_Type extends Model
{
    protected $fillable = [
        'name',
        'name_kh',
        'status'
    ];

    public function schools()
    {
        return $this->hasMany(High_School::class, 'edu_type_id');
    }
}
