<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ── User CRUD ────────────────────────────────────────────────────────────

    public function index()
    {
        $users = User::select('id', 'name', 'email', 'phone', 'address', 'created_at')->get();

        return response()->json($users, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'phone', 'address', 'created_at'),
            'message' => 'User created successfully.',
            'status' => 'success',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->address = $request->address;

        if ($request->filled('password')) {
            $request->validate(['password' => 'min:6']);
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'phone', 'address', 'created_at'),
            'message' => 'User updated successfully.',
            'status' => 'success',
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
            'status' => 'success',
        ], 200);
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed',

        ]);
        if (User::where('email', $request->email)->first()) {
            return response([
                'message' => 'Email already exists',
                'status' => 'failed',
            ], 200);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $token = $user->createToken($request->email)->plainTextToken;
        $user['token'] = $token;

        return response([
            'user' => $user,
            'message' => 'Registration Success',
            'status' => 'success',
        ], 201);
    }

    public function login(Request $request)
    {

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            $token = $user->createToken($request->email)->plainTextToken;

            return response([
                'token' => $token,
                'message' => 'Login Success',
                'status' => 'success',
            ], 200);
        }

        return response([
            'message' => 'The Provided Credentials are incorrect',
            'status' => 'failed',
        ], 401);
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();

        return response([
            'message' => 'Logout Success',
            'status' => 'success',
        ], 200);
    }

    public function logged_user()
    {
        $loggeduser = auth()->user();

        return response([
            'user' => $loggeduser,
            'message' => 'Logged User Data',
            'status' => 'success',
        ], 200);
    }

    public function update_profile(Request $request)
    {
        $loggeduser = auth()->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:1000',
        ]);

        $loggeduser->fill($data)->save();

        return response([
            'user' => $loggeduser->only('id', 'name', 'email', 'phone', 'address', 'created_at'),
            'message' => 'Profile updated successfully.',
            'status' => 'success',
        ], 200);
    }

    public function change_password(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|min:8',
        ]);

        $loggeduser = auth()->user();

        // Check if current password matches
        if (! Hash::check($request->current_password, $loggeduser->password)) {
            return response([
                'message' => 'Current password is incorrect.',
                'status' => 'error',
            ], 403);
        }

        // Update to new password
        $loggeduser->password = Hash::make($request->password);
        $loggeduser->save();

        return response([
            'message' => 'Password changed successfully.',
            'status' => 'success',
        ], 200);
    }
}
