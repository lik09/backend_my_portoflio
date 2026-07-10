<?php

namespace App\Http\Controllers;

use App\Models\ContactInfo;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class ContactInfoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'list' => ContactInfo::all()
        ]);
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
                'bio' => 'nullable|string',
                'bio_kh' => 'nullable|string',
                'status' => 'required|boolean'
            ]);

            $contact_info = ContactInfo::create($validated);
            
            return response()->json([
                'message' => __('Data added successfully'),
                'data' => $contact_info
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
         return response()->json([
            'error' => 'error server',
            'message' => $e->getMessage(),
         ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $contact_info = ContactInfo::findOrFail($id);

            return response()->json([
                'list' => $contact_info,
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Not Found',
                'message' => __('Contact info with ID :id not found', ['id' => $id])
            ], 404);
        }

    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $contact_info = ContactInfo::findOrFail($id);

        try{

            $validated = $request->validate([
                'title' => 'sometimes|required|string',
                'title_kh' => 'sometimes|required|string',
                'bio' => 'nullable|string',
                'bio_kh' => 'nullable|string',
                'status' => 'sometimes|required|boolean'
            ]);

            $contact_info->update($validated);

            return response()->json([
                'message' => __('Data updated successfully'),
                'data' => $contact_info
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
         return response()->json([
            'error' => 'error server',
            'message' => $e->getMessage(),
         ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
                $contact_info = ContactInfo::findOrFail($id);

                $contact_info->delete();

                return response()->json([
                    'message' => __('Data deleted successfully'),
                    'data' => $contact_info
                ], 200);

            } catch (ModelNotFoundException $e) {
                return response()->json([
                    'error' => 'Not Found',
                    'message' => __('Contact info with ID :id not found', ['id' => $id])
                ], 404);
            } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
                return response()->json([
                    'error' => 'Server Error',
                    'message' => $e->getMessage(),
                ], 500);
            }
                
        }
}
