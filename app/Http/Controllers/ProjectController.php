<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            //$projects = Project::all();
            $projects = Project::with('project_type')->get(); 

            return response()->json([
                'list' => $projects
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
                'name'              => 'required|string|max:255',
                'name_kh'           => 'required|string|max:255',
                'pro_type_id'       => 'required|exists:project__types,id',
                'description'       => 'nullable|string',
                'description_kh'    => 'nullable|string',

                'images'            => 'nullable|array',
                'images.*'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',

                'technologies'      => 'nullable|array',
                'technologies.*'    => 'string|max:255',

                'url_live_demo'     => 'nullable|url',
                'url_code_project'  => 'nullable|url',
                'release_year'      => 'required|integer|min:1900|max:' . date('Y'),
                'start_date'        => 'nullable|date',
                'end_date'          => 'nullable|date|after_or_equal:start_date',
                'customer_used'     => 'nullable|integer|min:0',
                'status'            => 'required|boolean',
            ]);

            // Handle image upload
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePaths[] = $image->store('projects', 'public');
                }
            }

            // Save project
            $project = Project::create([
                'name'             => $validated['name'],
                'name_kh'          => $validated['name_kh'],
                'pro_type_id'      => $validated['pro_type_id'],
                'description'      => $validated['description'] ?? null,
                'description_kh'   => $validated['description_kh'] ?? null,
                'technologies'     => $validated['technologies'] ?? [],
                'images'           => $imagePaths,
                'url_live_demo'    => $validated['url_live_demo'] ?? null,
                'url_code_project' => $validated['url_code_project'] ?? null,
                'release_year'     => $validated['release_year'],
                'start_date'       => $validated['start_date'] ?? null,
                'end_date'         => $validated['end_date'] ?? null,
                'customer_used'    => $validated['customer_used'] ?? null,
                'status'           => $validated['status'],
            ]); 

            return response()->json([
                'list'    => $project,
                'message' => 'Data created successfully!'
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
        $projects = Project::with(["project_type"])->findOrFail($id);
        return response()->json([
            "data" => $projects
        ],201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'name_kh'           => 'required|string|max:255',
            'pro_type_id'       => 'required|exists:project__types,id',
            'description'       => 'nullable|string',
            'description_kh'    => 'nullable|string',

            'images'            => 'nullable|array',
            'images.*'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',

            'technologies'      => 'nullable|array',
            'technologies.*'    => 'string|max:255',

            'url_live_demo'     => 'nullable|url',
            'url_code_project'  => 'nullable|url',
            'release_year'      => 'required|integer|min:1900|max:' . date('Y'),
            'start_date'        => 'nullable|date',
            'end_date'          => 'nullable|date|after_or_equal:start_date',
            'customer_used'     => 'nullable|integer|min:0',
            'status'            => 'required|boolean',
        ]);

        // Handle image upload
        if ($request->hasFile('images')) {
            // Delete old images
            if (!empty($project->images)) {
                foreach ($project->images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $newPaths = [];
            foreach ($request->file('images') as $image) {
                $newPaths[] = $image->store('projects', 'public');
            }

            $validated['images'] = $newPaths;
        } else {
            // Keep existing images if no new upload
            $validated['images'] = $project->images;
        }

        // Update project
        $project->update($validated);

        return response()->json([
            'list'    => $project,
            'message' => 'Data updated successfully!'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $projects = Project::findOrFail($id);

        if ($projects->images) {
            foreach ($projects->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $projects->delete();

        return response()->json([
            'list' => $projects,
            'message' => "Data deleted successfully!"
        ], 200);
    }
}
