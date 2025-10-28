<?php

namespace App\Http\Controllers;

use App\Models\Talks;
use Exception;
use Illuminate\Console\View\Components\Task;
use Illuminate\Http\Request;

class TalkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $talks = Talks::all();
            return response()->json([
                'list' => $talks
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
                'title' => 'required|string',
                'title_kh' => 'required|string',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $talks = Talks::create($validated);

            return response()->json([
                'message' => 'Talk added succesfully',
                'list' => $talks
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
        return response()->json([
            'list' => Talks::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $talks = Talks::findOrFail($id);

            $validated = $request->validate([
                'title' => 'required|string',
                'title_kh' => 'required|string',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $talks->update($validated);

            return response()->json([
                'message' => 'Talk updated successfully',
                'list' => $talks
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
        try{
            $talks = Talks::findOrFail($id);

            $talks->delete();
            
            return response()->json([
                'message' => 'Talk deleted successfully',
                'list' => $talks
            ]);
        }catch(Exception $e){
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
