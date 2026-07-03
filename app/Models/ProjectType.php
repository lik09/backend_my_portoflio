<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectType extends Model
{
    protected $table = 'project__types';

    protected  $fillable = ['name', 'name_kh', 'status'];

    public function projects(){
        return $this->hasMany(Project::class);
    }

}
