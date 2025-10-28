<?php

namespace App\Http\Controllers;

use App\Models\Education_Info;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class EducationInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $education_info = Education_Info::all();
            return response()->json($education_info);
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
                'title' => 'required|string',
                'bio' => 'nullable|string',
                'status' => 'required|boolean'
           ]);
           $edu_info = Education_Info::create($validated);

           return response()->json([
                'message' => 'Education Info Added succesfully',
                'data' => $edu_info
           ]);


        }catch(Exception $e){
           return response()->json([
                'error' => 'Servr error',
                'message' => $e->getMessage()
            ], 500 );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        
        try{
            return response()->json([
                'list' => Education_Info::findOrFail($id),
            ]);
        }catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Not Found',
                'message' => "Education Info with ID $id not found"
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{

            $edu_info = Education_Info::findOrFail($id);
            $validated = $request->validate([
                'title' => 'required|string',
                'bio' => 'nullable|string',
                'status' => 'required|boolean'
            ]);
            $edu_info->update($validated);

            return response()->json([
                'message' => 'Education Info updated succesfully',
                'data' => $edu_info
            ]);


        }catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Not Found',
                'message' => "Education Info with ID $id not found"
            ], 404);
        }catch(Exception $e){
           return response()->json([
                'error' => 'Servr error',
                'message' => $e->getMessage()
            ], 500 );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try{

            $edu_info = Education_Info::findOrFail($id);
          
            $edu_info->delete();

            return response()->json([
                'message' => 'Education Info deleted succesfully',
                'list' => $edu_info
            ]);


        }catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Not Found',
                'message' => "Education Info with ID $id not found"
            ], 404);
        }catch(Exception $e){
           return response()->json([
                'error' => 'Servr error',
                'message' => $e->getMessage()
            ], 500 );
        }
    }
}
