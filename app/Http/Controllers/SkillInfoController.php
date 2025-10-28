<?php

namespace App\Http\Controllers;

use App\Models\Skill_Info;
use Exception;
use Illuminate\Http\Request;
use Mockery\Expectation;

class SkillInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $skill_info = Skill_Info::all();
            return response()->json($skill_info);
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
                'bio' => 'required|string',
                'status' => 'required|boolean',
            ]);

            $skill_info = Skill_Info::create($validated);
            
            return response()->json([
                'message' => 'Skill Info added successfully',
                'list' => $skill_info
            ]);

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
            'list' => Skill_Info::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $skill_info = Skill_Info::findOrfail($id);
            $validated = $request->validate([
                'title' => 'required|string',
                'bio' => 'required|string',
                'status' => 'required|boolean',
            ]);

            $skill_info->update($validated);
            
            return response()->json([
                'message' => 'Skill Info updated successfully',
                'list' => $skill_info
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
        try {
            $skill_info = Skill_Info::findOrFail($id);
            $skill_info->delete();

            return response()->json([
                'message' => 'Skill Info deleted successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
