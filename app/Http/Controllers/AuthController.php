<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private function userPayload(User $user): array
    {
        return [
            'id'            => $user->id,
            'name'          => $user->name,
            'username'      => $user->username,
            'email'         => $user->email,
            'language'      => $user->language ?? 'en',
            'profile_image' => $user->profile_image,
        ];
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error'   => 'Invalid credentials',
                'message' => 'The username or password is incorrect.',
            ], 401);
        }

        $token = Str::random(60);
        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = User::where('remember_token', $token)->firstOrFail();
            return response()->json(['user' => $this->userPayload($user)]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }

    public function logout(Request $request)
    {
        $bearer = $request->bearerToken();

        if ($bearer) {
            User::where('remember_token', $bearer)->update(['remember_token' => null]);
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function updateProfile(Request $request)
    {
        $token = $request->bearerToken();
        $user  = User::where('remember_token', $token)->first();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'username'      => 'sometimes|required|string|max:255|unique:users,username,' . $user->id,
            'email'         => 'sometimes|required|email|unique:users,email,' . $user->id,
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            if ($request->hasFile('profile_image')) {
                if ($user->profile_image) {
                    Storage::disk('public')->delete($user->profile_image);
                }
                $validated['profile_image'] = $request->file('profile_image')->store('avatars', 'public');
            } else {
                unset($validated['profile_image']);
            }

            $user->update($validated);
            $user->refresh();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user'    => $this->userPayload($user),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = User::where('remember_token', $token)->firstOrFail();

            $request->validate([
                'current_password' => 'required|string',
                'new_password'     => 'required|string|min:8|confirmed',
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'Wrong current password'], 422);
            }

            $user->update(['password' => Hash::make($request->new_password)]);

            return response()->json(['message' => 'Password changed successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateLanguage(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $user = User::where('remember_token', $token)->firstOrFail();

            $validated = $request->validate([
                'language' => 'required|in:en,km',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Language updated successfully',
                'user'    => $this->userPayload($user),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }
}
