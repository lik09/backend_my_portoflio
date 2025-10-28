<?php

namespace App\Http\Controllers;

use App\Models\Project_Info;
use Exception;
use Illuminate\Http\Request;

class ProjectInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $project_info = Project_Info::all();
            return response()->json($project_info);
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
                'bio'=> 'required|string',
                'status' => 'required|boolean'
            ]);

            $project_info = Project_Info::create($validated);

            return response()->json([
                'message' => 'Project Info added successfully',
                'list' => $project_info
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
        $project_info = Project_Info::findOrFail($id);
        return response()->json($project_info);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $project_info = Project_Info::findOrFail($id);

            $validated = $request->validate([
                'title' => 'required|string',
                'bio'=> 'required|string',
                'status' => 'required|boolean'
            ]);

            $project_info->update($validated);

            return response()->json([
                'message' => 'Project Info undated successfully',
                'project info' => $project_info
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
            $project_info = Project_Info::findOrFail($id);
            $project_info->delete();

            return response()->json([
                'message' => 'Project Info deleted successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
