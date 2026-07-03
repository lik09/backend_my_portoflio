<?php

namespace App\Http\Controllers;

use App\Models\ExperienceInfo;
use Exception;
use Illuminate\Http\Request;

class ExperienceInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $experiences_info = ExperienceInfo::all();
            return response()->json($experiences_info);
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
                'title_kh' => 'nullable|string',
                'bio' => 'required|string',
                'bio_kh' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $experiences_info = ExperienceInfo::create($validated);

            return response()->json([
                'message' => 'Experience Info added successfully',
                'experience info' => $experiences_info
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
        $experiences_info = ExperienceInfo::findOrFail($id);
        return response()->json($experiences_info);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $experiences_info = ExperienceInfo::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string',
                'title_kh' => 'nullable|string',
                'bio' => 'sometimes|required|string',
                'bio_kh' => 'nullable|string',
                'status' => 'sometimes|required|boolean'
            ]);

            $experiences_info->update($validated);

            return response()->json([
                'message' => 'Experience Info updated successfully',
                'experience info' => $experiences_info
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
            $experience_info = ExperienceInfo::findOrFail($id);
            $experience_info->delete();

            return response()->json([
                'message' => 'Experience Info deleted successfully.'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
