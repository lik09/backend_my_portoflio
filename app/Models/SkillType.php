<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillType extends Model
{
    protected $table = 'skill__types';

    protected $fillable = ['name', 'name_kh', 'status'];

    public function skills(){
        return $this->hasMany(Skill::class);
    }

}
