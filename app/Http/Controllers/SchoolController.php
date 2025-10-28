<?php

namespace App\Http\Controllers;

use App\Models\High_School;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SchoolController extends Controller
{
    public function index()
    {
        $schools = High_School::with('eduType')->get()->map(function ($school) {
        return [
            'id' => $school->id,
            'edu_type_id' => [
                'id' => $school->eduType?->id,
                'name' => $school->eduType?->name,
                'name_kh' => $school->eduType?->name_kh,
            ],
            'name_school' => $school->name_school,
            'name_school_kh' => $school->name_school_kh,
            'logo_school' => $school->logo_school,
            'description_study' => $school->description_study,
            'description_study_kh' => $school->description_study_kh,
            'location' => $school->location,
            'location_kh' => $school->location_kh,
            'images' => $school->images,
            'status' => $school->status,
            'created_at' => $school->created_at,
            'updated_at' => $school->updated_at,
        ];
    });

        return response()->json([
            'list' => $schools
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'edu_type_id'            => 'required|exists:education__types,id',
                'name_school'            => 'required|string|max:191|unique:high__schools,name_school',
                'name_school_kh'         => 'required|string|max:191|unique:high__schools,name_school_kh',
                'logo_school'            => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'description_study'      => 'nullable|array',
                'description_study.*'    => 'string',
                'description_study_kh'   => 'nullable|array',
                'description_study_kh.*' => 'string',
                'location'               => 'nullable|string',
                'location_kh'            => 'nullable|string',
                'images'                 => 'nullable|array',
                'images.*'               => 'image|mimes:jpeg,png,jpg,gif|max:5120',
                'status'                 => 'required|boolean'
            ]);

            $logoPath = $request->hasFile('logo_school')
                ? $request->file('logo_school')->store('high_school/logo_highschool', 'public')
                : null;

            // Upload multiple images if exists
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    if ($image->isValid()) {
                        $imagePaths[] = $image->store('high_school/photo_highschool', 'public');
                    } else {
                        return response()->json([
                            'error' => "Image at index $index failed to upload",
                            'message' => "Please check the file type or size"
                        ], 422);
                    }
                }
            }

            $high_school = High_School::create([
                'edu_type_id'          => $validated['edu_type_id'],
                'name_school'          => $validated['name_school'],
                'name_school_kh'       => $validated['name_school_kh'],
                'logo_school'          => $logoPath,
                'description_study'    => $validated['description_study'] ?? [],
                'description_study_kh' => $validated['description_study_kh'] ?? [],
                'location'             => $validated['location'] ?? null,
                'location_kh'          => $validated['location_kh'] ?? null,
                'images'               => $imagePaths,
                'status'               => $validated['status']
            ]);

            return response()->json([
                'message' => 'Data added successfully',
                'data'    => $high_school
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $high_school = High_School::find($id);

        if (!$high_school) {
            return response()->json(['error' => 'Not Found'], 404);
        }

        return response()->json($high_school);
    }

    public function update(Request $request, string $id)
    {
        $high_school = High_School::find($id);

        if (!$high_school) {
            return response()->json(['error' => 'Not Found'], 404);
        }

        try {
            $validated = $request->validate([
                'edu_type_id'            => 'sometimes|exists:education__types,id',
                'name_school'            => 'sometimes|string|max:191|unique:high__schools,name_school,' . $id,
                'name_school_kh'         => 'sometimes|string|max:191|unique:high__schools,name_school_kh,' . $id,
                'logo_school'            => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'description_study'      => 'nullable|array',
                'description_study.*'    => 'string',
                'description_study_kh'   => 'nullable|array',
                'description_study_kh.*' => 'string',
                'location'               => 'nullable|string',
                'location_kh'            => 'nullable|string',
                'images'                 => 'nullable|array',
                'images.*'               => 'image|mimes:jpeg,png,jpg,gif|max:5120',
                'status'                 => 'sometimes|boolean'
            ]);

            // Keep old values if not updated
            $validated['description_study']    = $validated['description_study'] ?? $high_school->description_study;
            $validated['description_study_kh'] = $validated['description_study_kh'] ?? $high_school->description_study_kh;

            // Replace logo
            if ($request->hasFile('logo_school')) {
                if (!empty($high_school->logo_school)) {
                    Storage::disk('public')->delete($high_school->logo_school);
                }
                $validated['logo_school'] = $request->file('logo_school')->store('high_school/logo_highschool', 'public');
            } else {
                $validated['logo_school'] = $high_school->logo_school;
            }

            // Replace multiple images
            if ($request->hasFile('images')) {
                if (!empty($high_school->images)) {
                    foreach ($high_school->images as $img) {
                        Storage::disk('public')->delete($img);
                    }
                }

                $newPaths = [];
                foreach ($request->file('images') as $image) {
                    $newPaths[] = $image->store('high_school/photo_highschool', 'public');
                }
                $validated['images'] = $newPaths;
            } else {
                $validated['images'] = $high_school->images;
            }

            $high_school->update($validated);

            return response()->json([
                'message' => 'Data updated successfully',
                'data'    => $high_school
            ]);

        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $high_school = High_School::find($id);

        if (!$high_school) {
            return response()->json(['error' => 'Not Found'], 404);
        }

        if (!empty($high_school->logo_school)) {
            Storage::disk('public')->delete($high_school->logo_school);
        }

        if (!empty($high_school->images)) {
            foreach ($high_school->images as $img) {
                Storage::disk('public')->delete($img);
            }
        }

        $high_school->delete();

        return response()->json(['message' => 'Data deleted successfully']);
    }
}
