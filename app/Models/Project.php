<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable =[
        'name','name_kh','pro_type_id','description','description_kh','images',
        'technologies','url_live_demo','url_code_project','release_year','start_date',
        'end_date','customer_used','status'
    ];

    protected $casts = [
        'images' => 'array',
        'technologies' => 'array',
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    public function project_type()
    {
        return $this->belongsTo(Project_Type::class, 'pro_type_id');
    }

}
