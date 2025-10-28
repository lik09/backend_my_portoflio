<?php

namespace App\Http\Controllers;

use App\Models\Experience_Info;
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
            $experiences_info = Experience_Info::all();
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
                'bio'=> 'required|string',
                'status' => 'required|boolean'
            ]);

            $experiences_info = Experience_Info::create($validated);

            return response()->json([
                'message' => 'Experience Info added successfully',
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $experiences_info = Experience_Info::findOrFail($id);
        return response()->json($experiences_info);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $experiences_info = Experience_Info::findOrFail($id);

            $validated = $request->validate([
                'title' => 'required|string',
                'bio'=> 'required|string',
                'status' => 'required|boolean'
            ]);

            $experiences_info->update($validated);

            return response()->json([
                'message' => 'Experience Info undated successfully',
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
            $experience_info = Experience_Info::findOrFail($id);
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
