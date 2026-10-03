<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordReset;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class PasswordResetController extends Controller
{
    public function send_reset_password_email(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Check if the user exists
        $user = User::where('email', $email)->first();
        if (! $user) {
            return response([
                'message' => 'Email does not exist',
                'status' => 'failed',
            ], 404);
        }

        // Generate a 4-digit OTP
        $otp = random_int(1000, 9999);

        // Save or update the OTP in password_resets table
        PasswordReset::updateOrCreate(
            ['email' => $email],
            [
                'email' => $email,
                'otp' => $otp,
                'created_at' => Carbon::now(),
            ]
        );

        // Send the OTP via email
        Mail::send('reset', ['code' => $otp], function (Message $message) use ($email) {
            $message->subject('Reset Your Password');
            $message->to($email);
        });

        return response([
            'message' => 'Password reset code sent. Check your email.',
            'status' => 'success',
        ], 200);
    }

    // Reset the password using OTP from the request body or URL
    public function reset(Request $request, $otp = null)
    {
        // Validate the email, OTP, and password
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:4',
            'password' => 'required|confirmed',
        ]);

        $email = $request->email;
        $password = $request->password;
        $otp = $request->otp ?? $otp;

        // Delete codes older than 20 minutes to prevent re-use
        $expirationTime = Carbon::now()->subMinutes(20);
        PasswordReset::where('created_at', '<=', $expirationTime)->delete();

        // Find the reset record by email and OTP
        $passwordReset = PasswordReset::where('email', $email)
            ->where('otp', $otp)
            ->first();

        if (! $passwordReset) {
            return response([
                'message' => 'Invalid or expired reset code',
                'status' => 'failed',
            ], 404);
        }

        // Reset the user's password
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->password = Hash::make($password);
            $user->save();

            // Delete the password reset record
            PasswordReset::where('email', $email)->delete();

            return response([
                'message' => 'Password reset successfully',
                'status' => 'success',
            ], 200);
        }

        return response([
            'message' => 'User not found',
            'status' => 'failed',
        ], 404);
    }
}
