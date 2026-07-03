<?php

namespace App\Http\Controllers;

use App\Models\EducationType;
use Exception;
use Illuminate\Http\Request;

class EducationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $education_type = EducationType::all();
            return response()->json(['list' =>  $education_type ]
            );
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
        try{
           $validated = $request->validate([
                'name' => 'required|string',
                'name_kh' => 'nullable|string',
                'status' => 'required|boolean'
           ]);
           $edu_type = EducationType::create($validated);

           return response()->json([
                'message' => 'Education Type added successfully',
                'data' => $edu_type
           ], 201);


        }catch(Exception $e){
           return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json([
            'list' => EducationType::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $edu_type = EducationType::findOrFail($id);
            $validated = $request->validate([
                'name' => 'sometimes|required|string',
                'name_kh' => 'nullable|string',
                'status' => 'sometimes|required|boolean'
            ]);
            $edu_type->update($validated);

            return response()->json([
                'message' => 'Education Type updated successfully',
                'data' => $edu_type
            ]);


        }catch(Exception $e){
           return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{
            $edu_type = EducationType::findOrFail($id);
           
            $edu_type->delete();

            return response()->json([
                'message' => 'Education Type deleted successfully',
                'data' => $edu_type
            ]);


        }catch(Exception $e){
           return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
