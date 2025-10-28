<?php

use App\Http\Controllers\ConnectMeController;
use App\Http\Controllers\ContactFormMailController;
use App\Http\Controllers\ContactInfoController;
use App\Http\Controllers\EducationInfoController;
use App\Http\Controllers\EducationTypeController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ExperienceInfoController;
use App\Http\Controllers\HighSchoolController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectInfoController;
use App\Http\Controllers\ProjectTypeController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\ShortCourseController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\SkillInfoController;
use App\Http\Controllers\SkillTypeController;
use App\Http\Controllers\TalkController;
use App\Models\Contact_Info;
use App\Models\Education_Info;
use App\Models\Project_Info;
use Illuminate\Http\Request;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('profiles', ProfileController::class);
Route::apiResource('experiences', ExperienceController::class);
Route::apiResource('experiences_info', ExperienceInfoController::class);
Route::apiResource('project_info', ProjectInfoController::class);
Route::apiResource('project_type', ProjectTypeController::class);
Route::apiResource('project', ProjectController::class);
Route::apiResource('skill_info', SkillInfoController::class);
Route::apiResource('skill_type', SkillTypeController::class);
Route::apiResource('skill', SkillController::class);
Route::post('/send-message', [ContactFormMailController::class, 'send']);
Route::apiResource('talk', TalkController::class);
Route::apiResource('connect_me', ConnectMeController::class);
Route::apiResource('contact_info', ContactInfoController::class);
Route::apiResource('education_info', EducationInfoController::class);
Route::apiResource('education_type', EducationTypeController::class);
Route::apiResource('school', SchoolController::class);
Route::apiResource('short_course', ShortCourseController::class);
Route::get('/profiles/{id}/download-cv', [ProfileController::class, 'downloadCv']);


// Route::middleware('api')->group(function () {
//     Route::apiResource('profiles', ProfileController::class);
// });
