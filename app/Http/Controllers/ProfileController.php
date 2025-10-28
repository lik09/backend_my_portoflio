<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profiles = Profile::all();
        return response()->json($profiles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'fullname' => 'required|string|max:255',
                'bio' => 'required|string',
                'connect_with_me' => 'nullable|string', // JSON string
                'status' => 'required|boolean',
                'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
                'photo_cover' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if (!empty($validated['connect_with_me'])) {
                $decoded = json_decode($validated['connect_with_me'], true);
                if ($decoded === null) {
                    return response()->json(['error' => 'Invalid JSON for connect_with_me'], 422);
                }
                $validated['connect_with_me'] = $decoded;
            }

            // if ($request->hasFile('cv')) {
            //     $validated['cv'] = $request->file('cv')->store('cvs', 'public');
            // }

            if ($request->hasFile('cv')) {
                if (isset($profile) && $profile->cv) {
                    Storage::disk('public')->delete($profile->cv);
                }

                $originalName = $request->file('cv')->getClientOriginalName();
                $path = $request->file('cv')->store('cvs', 'public');

                $validated['cv'] = $path;
                $validated['cv_original_name'] = $originalName;
            }



            if ($request->hasFile('photo_cover')) {
                $validated['photo_cover'] = $request->file('photo_cover')->store('photo_covers', 'public');
            }

            $profile = Profile::create($validated);

            return response()->json([
                'message' => 'Profile created successfully',
                'profile' => $profile
            ], 201);

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
        $profile = Profile::findOrFail($id);
        return response()->json($profile);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {

            $profile = Profile::findOrFail($id);

            $validated = $request->validate([
                'fullname' => 'sometimes|required|string|max:255',
                'bio' => 'sometimes|required|string',
                'connect_with_me' => 'nullable|string', // JSON string from form-data
                'status' => 'sometimes|required|boolean',
                'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
                'photo_cover' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Decode JSON string for connect_with_me
            if (!empty($validated['connect_with_me'])) {
                $decoded = json_decode($validated['connect_with_me'], true);
                if ($decoded === null) {
                    return response()->json(['error' => 'Invalid JSON for connect_with_me'], 422);
                }
                $validated['connect_with_me'] = $decoded;
            }

            // Handle cv file upload
            if ($request->hasFile('cv')) {
                if ($profile->cv) {
                    Storage::disk('public')->delete($profile->cv);
                }
                $validated['cv'] = $request->file('cv')->store('cvs', 'public');
            }

            // Handle photo_cover file upload
            if ($request->hasFile('photo_cover')) {
                if ($profile->photo_cover) {
                    Storage::disk('public')->delete($profile->photo_cover);
                }
                $validated['photo_cover'] = $request->file('photo_cover')->store('photo_covers', 'public');
            }

            $profile->update($validated);

            return response()->json([
                'message' => 'Profile updated successfully',
                'profile' => $profile,
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
       $profile = Profile::findOrFail($id);

        // Delete stored files
        if ($profile->cv) {
            Storage::disk('public')->delete($profile->cv);
        }
        if ($profile->photo_cover) {
            Storage::disk('public')->delete($profile->photo_cover);
        }

        $profile->delete();

        return response()->json(['message' => 'Profile deleted successfully']);
    }



    public function downloadCv($id)
    {
        $profile = Profile::findOrFail($id);

        if (!$profile->cv) {
            return response()->json(['message' => 'No CV uploaded'], 404);
        }

        $filePath = storage_path('app/public/' . $profile->cv);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Use cv_original_name if available, otherwise fallback
        $downloadName = $profile->cv_original_name ?? basename($filePath);

        return response()->download($filePath, $downloadName);
    }
}
