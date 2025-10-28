<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class High_School extends Model
{
    protected $fillable = [
        'edu_type_id',
        'name_school',
        'name_school_kh',
        'logo_school',
        'description_study',
        'description_study_kh',
        'location',
        'location_kh',
        'images',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'description_study' => 'array',
        'description_study_kh' => 'array',
        // 'status' => 'boolean',
    ];

    public function eduType()
    {
        return $this->belongsTo(Education_Type::class, 'edu_type_id');
    }

}
