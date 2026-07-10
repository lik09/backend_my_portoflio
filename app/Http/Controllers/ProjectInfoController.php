<?php

namespace App\Http\Controllers;

use App\Models\ProjectInfo;
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
            $project_info = ProjectInfo::all();
            return response()->json($project_info);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
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
                'title_kh' => 'nullable|string',
                'bio' => 'required|string',
                'bio_kh' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $project_info = ProjectInfo::create($validated);

            return response()->json([
                'message' => __('Project Info added successfully'),
                'list' => $project_info
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
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
        $project_info = ProjectInfo::findOrFail($id);
        return response()->json($project_info);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $project_info = ProjectInfo::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string',
                'title_kh' => 'nullable|string',
                'bio' => 'sometimes|required|string',
                'bio_kh' => 'nullable|string',
                'status' => 'sometimes|required|boolean'
            ]);

            $project_info->update($validated);

            return response()->json([
                'message' => __('Project Info updated successfully'),
                'project info' => $project_info
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
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
            $project_info = ProjectInfo::findOrFail($id);
            $project_info->delete();

            return response()->json([
                'message' => __('Project Info deleted successfully.')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
