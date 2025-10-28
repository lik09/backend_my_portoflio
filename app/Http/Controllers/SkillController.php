<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SkillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            
            $skill = Skill::with('skill_type')->get(); 

            return response()->json([
                'list' => $skill
            ]);
            
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
                'name_kh' => 'required|string',
                'skill_type_id' => 'required|integer|exists:skill__types,id',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'pct_status' => 'required|integer|min:0|max:255',
                'status' => 'required|boolean',
            ]);

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('images')) {
                $imagePath = $request->file('images')->store('skills', 'public');
            }


            $skill = Skill::create([
                'name'          => $validated['name'],
                'name_kh'       => $validated['name_kh'],
                'skill_type_id' => $validated['skill_type_id'],
                'description'   => $validated['description'],
                'description_kh'=> $validated['description_kh'],
                'images'        => $imagePath,
                'pct_status'    => $validated['pct_status'],
                'status'        => $validated['status']
            ]);
            
            return response()->json([
                'message' => 'Skill added successfully',
                'list' => $skill
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
            'list' => Skill::findOrfail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $skill = Skill::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string',
                'name_kh' => 'required|string',
                'skill_type_id' => 'required|integer|exists:skill__types,id',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'images' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'pct_status' => 'required|integer|min:0|max:255',
                'status' => 'required|boolean',
            ]);

            // Handle single image upload
            if ($request->hasFile('images')) {
                // delete old image if exists
                if (!empty($skill->images)) {
                    Storage::disk('public')->delete($skill->images);
                }

                // store new one
                $validated['images'] = $request->file('images')->store('skills', 'public');
            } else {
                $validated['images'] = $skill->images; // keep old
            }

            $skill->update($validated);

            return response()->json([
                'message' => 'Skill updated successfully',
                'list' => $skill
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
        $skill = Skill::findOrFail($id);

        if ($skill->images) {
            Storage::disk('public')->delete($skill->images);
        }

        $skill->delete();

        return response()->json([
            'list' => $skill,
            'message' => "Data deleted successfully!"
        ], 200);
    }
}
