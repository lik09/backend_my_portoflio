<?php

namespace App\Http\Controllers;

use App\Models\Project_Type;
use Exception;
use Illuminate\Http\Request;

class ProjectTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $project_type = Project_Type::all();
            return response()->json($project_type);
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
                'status' => 'required|boolean'
            ]);

            $project_type = Project_Type::create($validated);

            return response()->json([
                'message' => 'Project Type added successfully',
                'project type' => $project_type
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
        $project_type = Project_Type::findOrFail($id);
        return response()->json($project_type);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $project_type = Project_Type::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string',
                'status' => 'required|boolean'
            ]);

            $project_type->update($validated);

            return response()->json([
                'message' => 'Project Type udated successfully',
                'project Type' => $project_type
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
            $project_type = Project_Type::findOrFail($id);
            $project_type->delete();

            return response()->json([
                'message' => 'Project Type deleted successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
