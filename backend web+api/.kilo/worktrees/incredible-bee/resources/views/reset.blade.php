<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

<div style="max-width: 600px; margin: 50px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

    <!-- Header -->
    <header style="background-color: #4CAF50; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Password Reset Request</h1>
    </header>

    <!-- Content -->
    <main style="padding: 30px;">
        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 16px;">
            Hello,
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We received a request to reset your password. Please use the verification code below to continue. This code is valid for <strong>20 minutes</strong>.
        </p>

        <!-- OTP Code -->
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 25px; background-color: #f7f7f7; border: 1px solid #ccc; border-radius: 8px;">
                <span style="font-size: 30px; color: #4CAF50; font-weight: bold;">{{ $code }}</span>
            </div>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            If you didn’t request a password reset, you can safely ignore this email — no changes will be made.
        </p>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Need help? Contact our support team anytime.
        </p>
    </main>

    <!-- Footer -->
    <footer style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Thanks,<br><strong>The Codewire Team</strong></p>
        <p style="margin-top: 10px; font-size: 12px; color: #aaa;">
            This is an automated message — please do not reply directly to this email.
        </p>
    </footer>

</div>

</body>

</html>
