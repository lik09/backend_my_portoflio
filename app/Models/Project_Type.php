<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project_Type extends Model
{
    protected  $fillable = ['name', 'status'];

    public function projects(){
        return $this->hasMany(Project::class);
    }

}
