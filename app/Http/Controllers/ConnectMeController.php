<?php

namespace App\Http\Controllers;

use App\Models\Connect_Me;
use Exception;
use Illuminate\Http\Request;

class ConnectMeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $connect_me = Connect_Me::all();
            return response()->json([
                'list' => $connect_me
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
                'connection' => 'required|string',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'icon_name' => 'nullable|string',
                'icon_import' => 'nullable|string',
                'bg_box' => 'nullable|string',
                'status' => 'required|boolean',
            ]);

            $connect_me = Connect_Me::create($validated);
            
            return response()->json([
                'message' => 'Connect me added successfully',
                'list' => $connect_me
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
            'list' => Connect_Me::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $connect_me = Connect_Me::findOrFail($id);
            $validated = $request->validate([
                'name' => 'required|string',
                'name_kh' => 'required|string',
                'connection' => 'required|string',
                'description' => 'nullable|string',
                'description_kh' => 'nullable|string',
                'icon_name' => 'nullable|string',
                'icon_import' => 'nullable|string',
                'bg_box' => 'nullable|string',
                'status' => 'required|boolean',
            ]);

            $connect_me->update($validated);
            
            return response()->json([
                'message' => 'Connect me updated successfully',
                'list' => $connect_me
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
            $connect_me = Connect_Me::findOrFail($id);

            $connect_me->delete();
            
            return response()->json([
                'message' => 'Connect me deleted successfully',
                'list' => $connect_me
            ]);
        }catch(Exception $e){
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
