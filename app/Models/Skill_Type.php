<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill_Type extends Model
{
    protected $fillable = ['name', 'status' ];

    public function skills(){
        return $this->hasMany(Skill::class);
    }

}
