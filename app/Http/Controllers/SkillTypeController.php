<?php

namespace App\Http\Controllers;

use App\Models\SkillType;
use Exception;
use Illuminate\Http\Request;

class SkillTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $skill_type = SkillType::all();
            return response()->json(
             $skill_type
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
                'status' => 'required|boolean',
            ]);

            $skill_type = SkillType::create($validated);

            return response()->json([
                'message' => 'Skill Type added successfully',
                'list' => $skill_type
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
            'list' => SkillType::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $skill_type = SkillType::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string',
                'name_kh' => 'nullable|string',
                'status' => 'sometimes|required|boolean',
            ]);

            $skill_type->update($validated);
            
            return response()->json([
                'message' => 'Skill Type updated successfully',
                'list' => $skill_type
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
            $skill_type = SkillType::findOrFail($id);

            $skill_type->delete();
            
            return response()->json([
                'message' => 'Skill Type deleted successfully',
                'list' => $skill_type
            ]);
        }catch(Exception $e){
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
