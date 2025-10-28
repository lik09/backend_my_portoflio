<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = [
        'name',
        'name_kh',
        'skill_type_id',
        'description',
        'description_kh',
        'images',
        'pct_status',
        'status'
    ];

    public function skill_type()
    {
        return $this->belongsTo(Skill_Type::class, 'skill_type_id');
    }
}
