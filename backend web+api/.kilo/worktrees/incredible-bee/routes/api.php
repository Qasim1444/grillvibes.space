<?php

use App\Http\Controllers\API\Admin\ReportController;
use App\Http\Controllers\API\Admin\SettingController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\FoodCategoryController;
use App\Http\Controllers\API\FoodItemController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PasswordResetController;
use App\Http\Controllers\API\WhatsAppChatController;
use App\Http\Controllers\API\Guest\GuestMenuController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\whatsappapi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('places', [PlaceController::class, 'index']);
Route::post('places', [PlaceController::class, 'store']);
Route::get('places/{id}', [PlaceController::class, 'show']);
Route::put('places/{id}', [PlaceController::class, 'update']);
Route::delete('places/{id}', [PlaceController::class, 'destroy']);

// User CRUD
Route::get('users', [AuthController::class, 'index']);
Route::post('users', [AuthController::class, 'store']);
Route::put('users/{id}', [AuthController::class, 'update']);
Route::delete('users/{id}', [AuthController::class, 'destroy']);

Route::post('/register', [AuthController::class, 'register']); // User registration
Route::post('/login', [AuthController::class, 'login']);       // User login
Route::post('/forgot-password', [PasswordResetController::class, 'send_reset_password_email']);
Route::post('/send-reset-password-email', [PasswordResetController::class, 'send_reset_password_email']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::post('/reset-password/{otp}', [PasswordResetController::class, 'reset']);

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // User logout
    Route::get('/logged-user', [AuthController::class, 'logged_user']); // User looged
    Route::post('/update-profile', [AuthController::class, 'update_profile']); // Update own profile
    Route::post('/change-password', [AuthController::class, 'change_password']); // User change password

});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('customers', [CustomerController::class, 'index']);
Route::post('customers', [CustomerController::class, 'store']);
Route::get('customers/{id}', [CustomerController::class, 'show']);
Route::put('customers/{id}', [CustomerController::class, 'update']);
Route::delete('customers/{id}', [CustomerController::class, 'destroy']);

Route::get('food-categories', [FoodCategoryController::class, 'index']);
Route::post('food-categories', [FoodCategoryController::class, 'store']);
Route::get('food-categories/{id}', [FoodCategoryController::class, 'show']);
Route::put('food-categories/{id}', [FoodCategoryController::class, 'update']);
Route::delete('food-categories/{id}', [FoodCategoryController::class, 'destroy']);

Route::get('food-items', [FoodItemController::class, 'index']);
Route::post('food-items', [FoodItemController::class, 'store']);
Route::get('food-items/{id}', [FoodItemController::class, 'show']);
Route::put('food-items/{id}', [FoodItemController::class, 'update']);
Route::delete('food-items/{id}', [FoodItemController::class, 'destroy']);

Route::get('orders', [OrderController::class, 'index']);
Route::get('deletereport', [OrderController::class, 'deletereport']);
Route::post('orders', [OrderController::class, 'store']);
Route::match(['get', 'post'], 'orders/{id}/receipt', [OrderController::class, 'receipt']);
Route::get('orders/{id}', [OrderController::class, 'show']);
Route::put('orders/{id}', [OrderController::class, 'update']);
Route::delete('orders/{id}', [OrderController::class, 'destroy']);

Route::get('daily-summary/report', [ReportController::class, 'dailySummaryReport']);
Route::get('daily-summary/reportonway', [ReportController::class, 'dailySummaryReportonway']);
Route::get('daily-summary/reportdining', [ReportController::class, 'dailySummaryReportdining']);
Route::get('daily-summary/reportdelivery', [ReportController::class, 'dailySummaryReportdelivery']);
Route::get('daily-category-sales/report', [ReportController::class, 'dailyCategorySalesReport']);
Route::get('daily-category-sales-by-item-quantity/report', [ReportController::class, 'dailyCategorySalesByItemQuantityReport']);
Route::get('daily-category-sales-by-item-quantity/reportcurrentdate', [ReportController::class, 'dailyCategorySalesByItemQuantityReportcurrentdate']);

Route::get('daily-summary/quick-report', [ReportController::class, 'dailySummaryQuickReport']);
Route::get('daily-summary/top-ten-deals-report', [ReportController::class, 'dailySummaryTopTenReport']);

// Get all settings
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'store']);
Route::post('/settings/update', [SettingController::class, 'update']); // Using POST for update if you prefer
Route::delete('/settings/delete', [SettingController::class, 'destroy']);

Route::get('/get-whatsapp', [whatsappapi::class, 'index']);
Route::post('/generate-whatsapp-qr', [whatsappapi::class, 'generateQr']);
Route::post('/whatsapp/logout-device', [whatsappapi::class, 'logoutDevice']);

// WhatsApp chat proxy (browser -> Laravel -> WhatsApp API v2 server)
Route::get('/whatsapp/status', [WhatsAppChatController::class, 'status']);
Route::get('/whatsapp/conversations', [WhatsAppChatController::class, 'conversations']);
Route::get('/whatsapp/messages/{number}', [WhatsAppChatController::class, 'messages']);
Route::post('/whatsapp/send-message', [WhatsAppChatController::class, 'sendMessage']);
Route::post('/whatsapp/send-image', [WhatsAppChatController::class, 'sendImage']);
Route::post('/whatsapp/send-media', [WhatsAppChatController::class, 'sendMedia']);
Route::get('/whatsapp/calls', [WhatsAppChatController::class, 'calls']);
Route::post('/whatsapp/calls/{callId}/reject', [WhatsAppChatController::class, 'rejectCall']);

// ── Guest / QR — public, no auth ─────────────────────────────────────────────
// These routes serve the guest-facing QR menu ordering flow.
// No Sanctum middleware — the session_token in the request body is the auth.
Route::prefix('guest')->name('guest.')->group(function () {
    // QR scan → creates session + returns menu
    Route::get('/qr/{slug}',    [GuestMenuController::class, 'scanQr'])->name('qr.scan');

    // Browse menu (no session required)
    Route::get('/menu',         [GuestMenuController::class, 'menu'])->name('menu');

    // Cart persistence (session_token in body)
    Route::post('/cart',        [GuestMenuController::class, 'saveCart'])->name('cart.save');

    // Place order from saved cart
    Route::post('/order',       [GuestMenuController::class, 'placeOrder'])->name('order.place');

    // Poll order status from the confirmation screen
    Route::get('/order/{orderId}/status', [GuestMenuController::class, 'orderStatus'])->name('order.status');
});
