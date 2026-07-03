<?php

namespace App\Http\Controllers;

use App\Models\ShortCourse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShortCourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        try{
            $short_course = ShortCourse::all();
            return response()->json($short_course);
        }catch(Exception $e){
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'course_name'     => 'required|string|max:191|unique:short__courses,course_name',
                'course_name_kh'  => 'required|string|max:191|unique:short__courses,course_name_kh',
                'teacher_name'    => 'required|string|max:191',
                'teacher_name_kh' => 'required|string|max:191',
                'description'     => 'nullable|string',
                'description_kh'  => 'nullable|string',
                'time_study'      => 'nullable|string|max:100',
                'mode'            => 'required|in:online,direct',
                'status'          => 'required|boolean',
            ]);

            $short_course = ShortCourse::create($validated);

            return response()->json([
                'message' => 'Course added successfully',
                'data'    => $short_course
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Server Error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $course = ShortCourse::find($id);

        if (!$course) {
            return response()->json(['error' => 'Not Found'], 404);
        }

        return response()->json($course);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $course = ShortCourse::findOrFail($id);

            $validated = $request->validate([
                'course_name'     => 'sometimes|string|max:191|unique:short__courses,course_name,' . $id . ',id',
                'course_name_kh'  => 'sometimes|string|max:191|unique:short__courses,course_name_kh,' . $id . ',id',
                'teacher_name'    => 'sometimes|string|max:191',
                'teacher_name_kh' => 'sometimes|string|max:191',
                'description'     => 'nullable|string',
                'description_kh'  => 'nullable|string',
                'time_study'      => 'nullable|string|max:100',
                'mode'            => 'sometimes|in:online,direct',
                'status'          => 'sometimes|boolean',
            ]);

            if (empty($validated)) {
                return response()->json([
                    'message' => 'No fields were provided for update',
                    'data'    => $course
                ], 400);
            }

            $course->update($validated);
            $course->refresh();

            return response()->json([
                'message' => 'Course updated successfully',
                'data'    => $course
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Server error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            $course = ShortCourse::findOrFail($id);

            $course->delete();
            
            return response()->json([
                'message' => 'short course deleted successfully',
                'list' => $course
            ]);
        }catch(Exception $e){
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
