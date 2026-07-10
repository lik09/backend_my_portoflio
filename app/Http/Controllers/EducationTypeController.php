<?php

namespace App\Http\Controllers;

use App\Models\EducationType;
use Exception;
use Illuminate\Http\Request;

class EducationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $education_type = EducationType::all();
            return response()->json(['list' =>  $education_type ]
            );
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
                'name' => 'required|string|unique:education__types,name',
                'name_kh' => 'required|string|unique:education__types,name_kh',
                'status' => 'required|boolean'
           ]);
           $edu_type = EducationType::create($validated);

           return response()->json([
                'message' => __('Education Type added successfully'),
                'data' => $edu_type
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
        return response()->json([
            'list' => EducationType::findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $edu_type = EducationType::findOrFail($id);
            $validated = $request->validate([
                'name' => 'sometimes|required|string|unique:education__types,name,' . $id,
                'name_kh' => 'sometimes|required|string|unique:education__types,name_kh,' . $id,
                'status' => 'sometimes|required|boolean'
            ]);
            $edu_type->update($validated);

            return response()->json([
                'message' => __('Education Type updated successfully'),
                'data' => $edu_type
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
        try{
            $edu_type = EducationType::findOrFail($id);
           
            $edu_type->delete();

            return response()->json([
                'message' => __('Education Type deleted successfully'),
                'data' => $edu_type
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
