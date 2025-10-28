<?php

namespace App\Http\Controllers;

use App\Models\Experience;
use Exception;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $experiences = Experience::all();
            return response()->json($experiences);
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
                'title' => 'required|string',
                'icon' => 'nullable|string',
                'company_name' => 'required|string',
                'start_year' => 'required|string',
                'end_year' => 'nullable|string',
                'location' => 'required|string',
                'emp_type' => 'required|string',
                'description' => 'nullable|string',
                'technologies' => 'nullable|array',
                'key_achievements' => 'nullable|array',
                'status' => 'required|boolean'
            ]);

            $experience = Experience::create($validated);

            return response()->json([
                'message' => 'Experience added successfully.',
                'experience' => $experience
            ], 201);
        } catch (Exception $e) {
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
        $experiences = Experience::findOrFail($id);
        return response()->json($experiences);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $experience = Experience::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string',
                'icon' => 'nullable|string',
                'company_name' => 'sometimes|required|string',
                'start_year' => 'sometimes|required|string',
                'end_year' => 'nullable|string',
                'location' => 'sometimes|required|string',
                'emp_type' => 'sometimes|required|string',
                'description' => 'nullable|string',
                'technologies' => 'nullable|array',
                'key_achievements' => 'nullable|array',
                'status' => 'sometimes|required|boolean'
            ]);

            $experience->update($validated);

            return response()->json([
                'message' => 'Experience updated successfully.',
                'experience' => $experience
            ]);
        } catch (Exception $e) {
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
        try {
            $experience = Experience::findOrFail($id);
            $experience->delete();

            return response()->json([
                'message' => 'Experience deleted successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
