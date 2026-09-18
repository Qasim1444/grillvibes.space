<?php

use App\Http\Controllers\API\Guest\GuestMenuController;
use App\Http\Controllers\API\WhatsAppChatController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Web\AccountController;
use App\Http\Controllers\Web\BranchController;
use App\Http\Controllers\Web\BlogController;
use App\Http\Controllers\PublicBlogController;
use App\Http\Controllers\Web\CRM\DiscountCampaignController;
use App\Http\Controllers\Web\CRM\FeedbackController;
use App\Http\Controllers\Web\CRM\LoyaltyController;
use App\Http\Controllers\Web\CRM\PromoCodeController;
use App\Http\Controllers\Web\CustomerController;
use App\Http\Controllers\Web\Finance\ExpenseController;
use App\Http\Controllers\Web\Finance\ExpenseVoucherController;
use App\Http\Controllers\Web\Finance\PettyCashController;
use App\Http\Controllers\Web\FoodCategoryController;
use App\Http\Controllers\Web\FoodItemController;
use App\Http\Controllers\Web\HR\AttendanceController;
use App\Http\Controllers\Web\HR\DesignationController;
use App\Http\Controllers\Web\HR\EmployeeController;
use App\Http\Controllers\Web\HR\LeaveController;
use App\Http\Controllers\Web\HR\LoanController;
use App\Http\Controllers\Web\HR\OvertimeController;
use App\Http\Controllers\Web\HR\PayrollController;
use App\Http\Controllers\Web\Inventory\IngredientController;
use App\Http\Controllers\Web\Inventory\RecipeController;
use App\Http\Controllers\Web\Inventory\StockController;
use App\Http\Controllers\Web\KDS\KdsStationController;
use App\Http\Controllers\Web\Maintenance\AssetController;
use App\Http\Controllers\Web\Maintenance\MaintenanceRecordController;
use App\Http\Controllers\Web\OrderController;
use App\Http\Controllers\Web\PlaceController;
use App\Http\Controllers\Web\POSController;
use App\Http\Controllers\Web\Procurement\GoodsReceiptController;
use App\Http\Controllers\Web\Procurement\PurchaseOrderController;
use App\Http\Controllers\Web\Procurement\VendorController;
use App\Http\Controllers\Web\Reports\FoodCostReportController;
use App\Http\Controllers\Web\Reservations\ReservationController;
use App\Http\Controllers\Web\RoleController;
use App\Http\Controllers\Web\SettingController;
use App\Http\Controllers\Web\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Guest (unauthenticated) ──────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// ── Public QR menu (no auth required) ────────────────────────────────────────
// These render the guest-facing Vue SPA. Data comes via /api/guest/* endpoints.
Route::get('/menu/{slug}', function (string $slug) {
    return Inertia::render('Guest/QRMenu', ['slug' => $slug]);
})->name('guest.menu');

// ── Public marketing home page ───────────────────────────────────────────────
// Redirect the site root: authenticated users go to the dashboard, guests go
// to the login page (no public marketing page in this admin build).
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/product', [HomeController::class, 'product'])->name('product');
Route::post('/reservations/request', [HomeController::class, 'storeReservation'])
    ->name('reservations.request');
Route::get('/blog', [PublicBlogController::class, 'index'])->name('blog.public');
Route::get('/blog/{slug}', [PublicBlogController::class, 'show'])->name('blog.public.show');

// ── Authenticated (session/cookie auth) ──────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Dashboard (moved off `/` — the site root is now the public marketing page)
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('can.access:dashboard.view')->name('dashboard');

    // Customers (Inertia CRUD — replaces the old /api customers endpoints)
    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('can.access:customers.view')->name('customers.index');
    // JSON lookups (typeahead for Orders/POS pickers, phone->name for WhatsApp).
    // Declared before /{id} so they aren't captured as an id parameter. Reachable
    // from POS too, so either permission grants access.
    Route::get('/customers/search', [CustomerController::class, 'search'])
        ->middleware('can.access:customers.view,pos.view')->name('customers.search');
    Route::get('/customers/lookup', [CustomerController::class, 'lookup'])
        ->middleware('can.access:customers.view,pos.view')->name('customers.lookup');
    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('can.access:customers.create')->name('customers.store');
    Route::put('/customers/{id}', [CustomerController::class, 'update'])
        ->middleware('can.access:customers.update')->name('customers.update');
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy'])
        ->middleware('can.access:customers.delete')->name('customers.destroy');

    // Places
    Route::get('/places', [PlaceController::class, 'index'])
        ->middleware('can.access:places.view')->name('places.index');
    Route::post('/places', [PlaceController::class, 'store'])
        ->middleware('can.access:places.create')->name('places.store');
    Route::put('/places/{id}', [PlaceController::class, 'update'])
        ->middleware('can.access:places.update')->name('places.update');
    Route::delete('/places/{id}', [PlaceController::class, 'destroy'])
        ->middleware('can.access:places.delete')->name('places.destroy');

    // Outlet switcher — the Branches management page was removed, but any
    // authenticated user may still scope their own UI to an outlet (topbar).
    Route::post('/branches/switch', [BranchController::class, 'switch'])
        ->name('branches.switch');
    Route::put('/branches/{id}/attendance-settings', [BranchController::class, 'updateAttendanceSettings'])
        ->middleware('can.access:branches.update')->name('branches.attendance-settings');

    // Food Categories
    Route::get('/food-categories', [FoodCategoryController::class, 'index'])
        ->middleware('can.access:food-categories.view')->name('food-categories.index');
    Route::post('/food-categories', [FoodCategoryController::class, 'store'])
        ->middleware('can.access:food-categories.create')->name('food-categories.store');
    Route::put('/food-categories/{id}', [FoodCategoryController::class, 'update'])
        ->middleware('can.access:food-categories.update')->name('food-categories.update');
    Route::delete('/food-categories/{id}', [FoodCategoryController::class, 'destroy'])
        ->middleware('can.access:food-categories.delete')->name('food-categories.destroy');

    // Food Items (multipart image upload)
    Route::get('/food-items', [FoodItemController::class, 'index'])
        ->middleware('can.access:food-items.view')->name('food-items.index');
    Route::post('/food-items', [FoodItemController::class, 'store'])
        ->middleware('can.access:food-items.create')->name('food-items.store');
    Route::put('/food-items/{id}', [FoodItemController::class, 'update'])
        ->middleware('can.access:food-items.update')->name('food-items.update');
    Route::delete('/food-items/{id}', [FoodItemController::class, 'destroy'])
        ->middleware('can.access:food-items.delete')->name('food-items.destroy');

    // Blog posts
    Route::get('/admin/blog', [BlogController::class, 'index'])
        ->middleware('can.access:blog.view')->name('blog.index');
    Route::post('/blog', [BlogController::class, 'store'])
        ->middleware('can.access:blog.create')->name('blog.store');
    Route::put('/blog/{id}', [BlogController::class, 'update'])
        ->middleware('can.access:blog.update')->whereNumber('id')->name('blog.update');
    Route::delete('/blog/{id}', [BlogController::class, 'destroy'])
        ->middleware('can.access:blog.delete')->whereNumber('id')->name('blog.destroy');
    Route::post('/blog/categories', [BlogController::class, 'storeCategory'])
        ->middleware('can.access:blog.create')->name('blog.categories.store');
    Route::put('/blog/categories/{id}', [BlogController::class, 'updateCategory'])
        ->middleware('can.access:blog.update')->whereNumber('id')->name('blog.categories.update');
    Route::delete('/blog/categories/{id}', [BlogController::class, 'destroyCategory'])
        ->middleware('can.access:blog.delete')->whereNumber('id')->name('blog.categories.destroy');
    Route::post('/blog/tags', [BlogController::class, 'storeTag'])
        ->middleware('can.access:blog.create')->name('blog.tags.store');
    Route::put('/blog/tags/{id}', [BlogController::class, 'updateTag'])
        ->middleware('can.access:blog.update')->whereNumber('id')->name('blog.tags.update');
    Route::delete('/blog/tags/{id}', [BlogController::class, 'destroyTag'])
        ->middleware('can.access:blog.delete')->whereNumber('id')->name('blog.tags.destroy');

    // Users
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('can.access:users.view')->name('users.index');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('can.access:users.create')->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('can.access:users.update')->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('can.access:users.delete')->name('users.destroy');
    Route::post('/users/{id}/assign-roles', [UserController::class, 'assignRoles'])
        ->middleware('can.access:users.update')->name('users.assign-roles');

    // Roles & permissions (the matrix that drives every guard above)
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('can.access:roles.view')->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])
        ->middleware('can.access:roles.create')->name('roles.store');
    Route::put('/roles/{id}', [RoleController::class, 'update'])
        ->middleware('can.access:roles.update')->name('roles.update');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])
        ->middleware('can.access:roles.delete')->name('roles.destroy');

    // Orders (Inertia — replaces /api orders; store also generates + sends receipt)
    Route::get('/orders', [OrderController::class, 'index'])
        ->middleware('can.access:orders.view')->name('orders.index');
    // Promo preview for the POS "Apply" button — a read, so GET (no CSRF plumbing
    // in the fetch call). Declared before /orders/{id} so it can't be swallowed by
    // the parameterised routes below.
    Route::get('/orders/quote-promo', [OrderController::class, 'quotePromo'])
        ->middleware('can.access:orders.create,pos.view')->name('orders.quote-promo');
    // POS posts here too, so pos.view also grants order creation.
    Route::post('/orders', [OrderController::class, 'store'])
        ->middleware('can.access:orders.create,pos.view')->name('orders.store');
    // Printable HTML receipt — POS loads this in a hidden iframe after checkout
    // and it auto-opens the print dialog. Also reachable directly to reprint.
    Route::get('/orders/{id}/receipt', [OrderController::class, 'receipt'])
        ->middleware('can.access:orders.view,pos.view')->name('orders.receipt');
    Route::put('/orders/{id}', [OrderController::class, 'update'])
        ->middleware('can.access:orders.update')->name('orders.update');
    Route::delete('/orders/{id}', [OrderController::class, 'destroy'])
        ->middleware('can.access:orders.delete')->name('orders.destroy');

    // Point of Sale (menu/lookups as props; orders POST to the shared /orders route)
    Route::get('/pos', [POSController::class, 'index'])
        ->middleware('can.access:pos.view')->name('pos.index');

    // Settings (multipart logo upload)
    Route::get('/settings', [SettingController::class, 'index'])
        ->middleware('can.access:settings.view')->name('settings.index');
    Route::post('/settings', [SettingController::class, 'store'])
        ->middleware('can.access:settings.create')->name('settings.store');
    Route::put('/settings/{id}', [SettingController::class, 'update'])
        ->middleware('can.access:settings.update')->name('settings.update');
    Route::delete('/settings/{id}', [SettingController::class, 'destroy'])
        ->middleware('can.access:settings.delete')->name('settings.destroy');

    // ── HR & Payroll ─────────────────────────────────────────────────────────
    Route::prefix('hr')->name('hr.')->group(function () {
        // Designations
        Route::get('/designations', [DesignationController::class, 'index'])
            ->middleware('can.access:hr.designations.view')->name('designations.index');
        Route::post('/designations', [DesignationController::class, 'store'])
            ->middleware('can.access:hr.designations.create')->name('designations.store');
        Route::put('/designations/{id}', [DesignationController::class, 'update'])
            ->middleware('can.access:hr.designations.update')->name('designations.update');
        Route::delete('/designations/{id}', [DesignationController::class, 'destroy'])
            ->middleware('can.access:hr.designations.delete')->name('designations.destroy');

        // Employees (rows in `users` flagged is_employee)
        Route::get('/employees', [EmployeeController::class, 'index'])
            ->middleware('can.access:hr.employees.view')->name('employees.index');
        Route::post('/employees', [EmployeeController::class, 'store'])
            ->middleware('can.access:hr.employees.create')->name('employees.store');
        Route::put('/employees/{id}', [EmployeeController::class, 'update'])
            ->middleware('can.access:hr.employees.update')->name('employees.update');
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])
            ->middleware('can.access:hr.employees.delete')->name('employees.destroy');

        // Attendance — the day sheet posts the whole roster at once
        Route::get('/attendance', [AttendanceController::class, 'index'])
            ->middleware('can.access:hr.attendance.view')->name('attendance.index');
        Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore'])
            ->middleware('can.access:hr.attendance.create')->name('attendance.bulk');
        Route::get('/attendance/punch', [AttendanceController::class, 'punchPage'])
            ->name('attendance.punch.page');
        Route::post('/attendance/punch', [AttendanceController::class, 'punch'])
            ->middleware('throttle:10,1')->name('attendance.punch');
        Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy'])
            ->middleware('can.access:hr.attendance.delete')->name('attendance.destroy');

        // Leaves
        Route::get('/leaves', [LeaveController::class, 'index'])
            ->middleware('can.access:hr.leaves.view')->name('leaves.index');
        Route::post('/leaves', [LeaveController::class, 'store'])
            ->middleware('can.access:hr.leaves.create')->name('leaves.store');
        Route::put('/leaves/{id}', [LeaveController::class, 'update'])
            ->middleware('can.access:hr.leaves.update')->name('leaves.update');
        Route::put('/leaves/{id}/decide', [LeaveController::class, 'decide'])
            ->middleware('can.access:hr.leaves.approve')->name('leaves.decide');
        Route::delete('/leaves/{id}', [LeaveController::class, 'destroy'])
            ->middleware('can.access:hr.leaves.delete')->name('leaves.destroy');

        // Leave types (manage the dropdown options)
        Route::post('/leaves/types', [LeaveController::class, 'storeLeaveType'])
            ->middleware('can.access:hr.leaves.create')->name('leaves.types.store');
        Route::put('/leaves/types/{id}', [LeaveController::class, 'updateLeaveType'])
            ->middleware('can.access:hr.leaves.update')->name('leaves.types.update');
        Route::delete('/leaves/types/{id}', [LeaveController::class, 'destroyLeaveType'])
            ->middleware('can.access:hr.leaves.delete')->name('leaves.types.destroy');

        // Overtime
        Route::get('/overtime', [OvertimeController::class, 'index'])
            ->middleware('can.access:hr.overtime.view')->name('overtime.index');
        Route::post('/overtime', [OvertimeController::class, 'store'])
            ->middleware('can.access:hr.overtime.create')->name('overtime.store');
        Route::put('/overtime/{id}', [OvertimeController::class, 'update'])
            ->middleware('can.access:hr.overtime.update')->name('overtime.update');
        Route::put('/overtime/{id}/decide', [OvertimeController::class, 'decide'])
            ->middleware('can.access:hr.overtime.approve')->name('overtime.decide');
        Route::delete('/overtime/{id}', [OvertimeController::class, 'destroy'])
            ->middleware('can.access:hr.overtime.delete')->name('overtime.destroy');

        // Loans & advances
        Route::get('/loans', [LoanController::class, 'index'])
            ->middleware('can.access:hr.loans.view')->name('loans.index');
        Route::post('/loans', [LoanController::class, 'store'])
            ->middleware('can.access:hr.loans.create')->name('loans.store');
        Route::put('/loans/{id}', [LoanController::class, 'update'])
            ->middleware('can.access:hr.loans.update')->name('loans.update');
        Route::post('/loans/{id}/repay', [LoanController::class, 'repay'])
            ->middleware('can.access:hr.loans.update')->name('loans.repay');
        Route::delete('/loans/{id}', [LoanController::class, 'destroy'])
            ->middleware('can.access:hr.loans.delete')->name('loans.destroy');

        // Payroll — generate (draft) → approve (locks) → mark paid (settles loans).
        // Deductions share these permissions; they exist only to feed a run.
        Route::get('/payroll', [PayrollController::class, 'index'])
            ->middleware('can.access:hr.payroll.view')->name('payroll.index');
        Route::post('/payroll', [PayrollController::class, 'store'])
            ->middleware('can.access:hr.payroll.create')->name('payroll.store');
        Route::put('/payroll/{id}/approve', [PayrollController::class, 'approve'])
            ->middleware('can.access:hr.payroll.approve')->name('payroll.approve');
        Route::put('/payroll/{id}/paid', [PayrollController::class, 'markPaid'])
            ->middleware('can.access:hr.payroll.approve')->name('payroll.paid');
        Route::delete('/payroll/{id}', [PayrollController::class, 'destroy'])
            ->middleware('can.access:hr.payroll.delete')->name('payroll.destroy');
        Route::post('/deductions', [PayrollController::class, 'storeDeduction'])
            ->middleware('can.access:hr.payroll.create')->name('deductions.store');
        Route::put('/deductions/{id}', [PayrollController::class, 'updateDeduction'])
            ->middleware('can.access:hr.payroll.create')->name('deductions.update');
        Route::delete('/deductions/{id}', [PayrollController::class, 'destroyDeduction'])
            ->middleware('can.access:hr.payroll.delete')->name('deductions.destroy');
    });

    // ── CRM: loyalty, promo codes, discounts, feedback ───────────────────────
    Route::prefix('crm')->name('crm.')->group(function () {
        // Loyalty — settings + the append-only points ledger
        Route::get('/loyalty', [LoyaltyController::class, 'index'])
            ->middleware('can.access:crm.loyalty.view')->name('loyalty.index');
        Route::put('/loyalty/settings', [LoyaltyController::class, 'updateSettings'])
            ->middleware('can.access:crm.loyalty.update')->name('loyalty.settings');
        Route::post('/loyalty/adjust', [LoyaltyController::class, 'adjust'])
            ->middleware('can.access:crm.loyalty.update')->name('loyalty.adjust');
        Route::post('/loyalty/expire', [LoyaltyController::class, 'expire'])
            ->middleware('can.access:crm.loyalty.update')->name('loyalty.expire');

        // Promo codes
        Route::get('/promo-codes', [PromoCodeController::class, 'index'])
            ->middleware('can.access:crm.promo-codes.view')->name('promo-codes.index');
        Route::post('/promo-codes', [PromoCodeController::class, 'store'])
            ->middleware('can.access:crm.promo-codes.create')->name('promo-codes.store');
        Route::put('/promo-codes/{id}', [PromoCodeController::class, 'update'])
            ->middleware('can.access:crm.promo-codes.update')->name('promo-codes.update');
        Route::delete('/promo-codes/{id}', [PromoCodeController::class, 'destroy'])
            ->middleware('can.access:crm.promo-codes.delete')->name('promo-codes.destroy');

        // Discount campaigns
        Route::get('/discounts', [DiscountCampaignController::class, 'index'])
            ->middleware('can.access:crm.discounts.view')->name('discounts.index');
        Route::post('/discounts', [DiscountCampaignController::class, 'store'])
            ->middleware('can.access:crm.discounts.create')->name('discounts.store');
        Route::put('/discounts/{id}', [DiscountCampaignController::class, 'update'])
            ->middleware('can.access:crm.discounts.update')->name('discounts.update');
        Route::delete('/discounts/{id}', [DiscountCampaignController::class, 'destroy'])
            ->middleware('can.access:crm.discounts.delete')->name('discounts.destroy');

        // Feedback — reply and publish share the update permission
        Route::get('/feedback', [FeedbackController::class, 'index'])
            ->middleware('can.access:crm.feedback.view')->name('feedback.index');
        Route::post('/feedback', [FeedbackController::class, 'store'])
            ->middleware('can.access:crm.feedback.update')->name('feedback.store');
        Route::put('/feedback/{id}', [FeedbackController::class, 'update'])
            ->middleware('can.access:crm.feedback.update')->name('feedback.update');
        Route::put('/feedback/{id}/reply', [FeedbackController::class, 'reply'])
            ->middleware('can.access:crm.feedback.update')->name('feedback.reply');
        Route::put('/feedback/{id}/publish', [FeedbackController::class, 'togglePublish'])
            ->middleware('can.access:crm.feedback.update')->name('feedback.publish');
        Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy'])
            ->middleware('can.access:crm.feedback.delete')->name('feedback.destroy');
    });

    // ── KDS — Kitchen Display System ─────────────────────────────────────────
    Route::prefix('kds')->name('kds.')->group(function () {
        // Stations management
        Route::get('/stations', [KdsStationController::class, 'index'])
            ->middleware('can.access:kds.stations.view')->name('stations.index');
        Route::post('/stations', [KdsStationController::class, 'store'])
            ->middleware('can.access:kds.stations.create')->name('stations.store');
        Route::put('/stations/{id}', [KdsStationController::class, 'update'])
            ->middleware('can.access:kds.stations.update')->name('stations.update');
        Route::delete('/stations/{id}', [KdsStationController::class, 'destroy'])
            ->middleware('can.access:kds.stations.delete')->name('stations.destroy');

        // KDS Board (Inertia shell — no auth on the board itself so kitchen screens
        // can run logged-in as a shared user; the data polling endpoints are below)
        Route::get('/board', [KdsStationController::class, 'board'])
            ->middleware('can.access:kds.board.view')->name('board');

        // JSON polling — called every few seconds from the Vue board
        Route::get('/board/tickets', [KdsStationController::class, 'tickets'])
            ->middleware('can.access:kds.board.view')->name('board.tickets');

        // Item / order status mutations (JSON, called from Vue)
        Route::post('/items/{id}/bump', [KdsStationController::class, 'bumpItem'])
            ->middleware('can.access:kds.board.view')->name('items.bump');
        Route::post('/orders/{id}/bump', [KdsStationController::class, 'bumpOrder'])
            ->middleware('can.access:kds.board.view')->name('orders.bump');
        Route::put('/items/{id}/status', [KdsStationController::class, 'updateItemStatus'])
            ->middleware('can.access:kds.board.view')->name('items.status');
        Route::post('/items/{id}/recall', [KdsStationController::class, 'recallItem'])
            ->middleware('can.access:kds.board.view')->name('items.recall');
    });

    // ── Reservations, Floor Plan & Waitlist ───────────────────────────────────
    Route::prefix('reservations')->name('reservations.')->group(function () {
        // Reservations list + CRUD
        Route::get('/', [ReservationController::class, 'index'])
            ->middleware('can.access:reservations.view')->name('index');
        Route::post('/', [ReservationController::class, 'store'])
            ->middleware('can.access:reservations.create')->name('store');
        Route::put('/{id}', [ReservationController::class, 'update'])
            ->middleware('can.access:reservations.update')->name('update');
        Route::delete('/{id}', [ReservationController::class, 'destroy'])
            ->middleware('can.access:reservations.delete')->name('destroy');

        // Waitlist
        Route::post('/waitlist', [ReservationController::class, 'storeWaitlist'])
            ->middleware('can.access:reservations.create')->name('waitlist.store');
        Route::put('/waitlist/{id}', [ReservationController::class, 'updateWaitlist'])
            ->middleware('can.access:reservations.update')->name('waitlist.update');

        // Floor Plan
        Route::get('/floor-plan', [ReservationController::class, 'floorPlan'])
            ->middleware('can.access:reservations.view')->name('floor-plan');
        Route::post('/floor-plan/save', [ReservationController::class, 'saveFloorPlan'])
            ->middleware('can.access:reservations.update')->name('floor-plan.save');

        // Dining Tables CRUD (managed from floor plan page)
        Route::post('/tables', [ReservationController::class, 'storeDiningTable'])
            ->middleware('can.access:reservations.update')->name('tables.store');
        Route::put('/tables/{id}', [ReservationController::class, 'updateDiningTable'])
            ->middleware('can.access:reservations.update')->name('tables.update');
        Route::delete('/tables/{id}', [ReservationController::class, 'destroyDiningTable'])
            ->middleware('can.access:reservations.update')->name('tables.destroy');
    });

    // ── Asset & Equipment Maintenance ─────────────────────────────────────────
    Route::prefix('maintenance')->name('maintenance.')->group(function () {
        // Asset register
        Route::get('/assets', [AssetController::class, 'index'])
            ->middleware('can.access:maintenance.assets.view')->name('assets.index');
        Route::post('/assets', [AssetController::class, 'store'])
            ->middleware('can.access:maintenance.assets.create')->name('assets.store');
        Route::put('/assets/{id}', [AssetController::class, 'update'])
            ->middleware('can.access:maintenance.assets.update')->name('assets.update');
        Route::delete('/assets/{id}', [AssetController::class, 'destroy'])
            ->middleware('can.access:maintenance.assets.delete')->name('assets.destroy');

        // Maintenance work orders / logs (schedule → in progress → complete)
        Route::get('/logs', [MaintenanceRecordController::class, 'index'])
            ->middleware('can.access:maintenance.logs.view')->name('logs.index');
        Route::post('/logs', [MaintenanceRecordController::class, 'store'])
            ->middleware('can.access:maintenance.logs.create')->name('logs.store');
        Route::put('/logs/{id}', [MaintenanceRecordController::class, 'update'])
            ->middleware('can.access:maintenance.logs.update')->name('logs.update');
        Route::put('/logs/{id}/complete', [MaintenanceRecordController::class, 'complete'])
            ->middleware('can.access:maintenance.logs.update')->name('logs.complete');
        Route::delete('/logs/{id}', [MaintenanceRecordController::class, 'destroy'])
            ->middleware('can.access:maintenance.logs.delete')->name('logs.destroy');
    });

    // ── Expense & Petty-Cash Management ───────────────────────────────────────
    Route::prefix('finance')->name('finance.')->group(function () {
        // Expenses (raise → approve / reject)
        Route::get('/expenses', [ExpenseController::class, 'index'])
            ->middleware('can.access:expenses.view')->name('expenses.index');
        Route::post('/expenses', [ExpenseController::class, 'store'])
            ->middleware('can.access:expenses.create')->name('expenses.store');
        Route::put('/expenses/{id}', [ExpenseController::class, 'update'])
            ->middleware('can.access:expenses.update')->name('expenses.update');
        Route::put('/expenses/{id}/approve', [ExpenseController::class, 'approve'])
            ->middleware('can.access:expenses.approve')->name('expenses.approve');
        Route::put('/expenses/{id}/reject', [ExpenseController::class, 'reject'])
            ->middleware('can.access:expenses.approve')->name('expenses.reject');
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy'])
            ->middleware('can.access:expenses.delete')->name('expenses.destroy');

        // Expense voucher claims (bundle expenses → paid out of a petty-cash float)
        Route::get('/vouchers', [ExpenseVoucherController::class, 'index'])
            ->middleware('can.access:vouchers.view')->name('vouchers.index');
        Route::post('/vouchers', [ExpenseVoucherController::class, 'store'])
            ->middleware('can.access:vouchers.create')->name('vouchers.store');
        Route::put('/vouchers/{id}', [ExpenseVoucherController::class, 'update'])
            ->middleware('can.access:vouchers.update')->name('vouchers.update');
        Route::put('/vouchers/{id}/approve', [ExpenseVoucherController::class, 'approve'])
            ->middleware('can.access:vouchers.approve')->name('vouchers.approve');
        Route::put('/vouchers/{id}/reject', [ExpenseVoucherController::class, 'reject'])
            ->middleware('can.access:vouchers.approve')->name('vouchers.reject');
        Route::delete('/vouchers/{id}', [ExpenseVoucherController::class, 'destroy'])
            ->middleware('can.access:vouchers.delete')->name('vouchers.destroy');

        // Petty-cash floats + their signed sub-ledger
        Route::get('/petty-cash', [PettyCashController::class, 'index'])
            ->middleware('can.access:petty-cash.view')->name('petty-cash.index');
        Route::post('/petty-cash/accounts', [PettyCashController::class, 'storeAccount'])
            ->middleware('can.access:petty-cash.create')->name('petty-cash.accounts.store');
        Route::put('/petty-cash/accounts/{id}', [PettyCashController::class, 'updateAccount'])
            ->middleware('can.access:petty-cash.update')->name('petty-cash.accounts.update');
        Route::delete('/petty-cash/accounts/{id}', [PettyCashController::class, 'destroyAccount'])
            ->middleware('can.access:petty-cash.delete')->name('petty-cash.accounts.destroy');
        Route::post('/petty-cash/transactions', [PettyCashController::class, 'storeTransaction'])
            ->middleware('can.access:petty-cash.create')->name('petty-cash.transactions.store');
        Route::delete('/petty-cash/transactions/{id}', [PettyCashController::class, 'destroyTransaction'])
            ->middleware('can.access:petty-cash.delete')->name('petty-cash.transactions.destroy');
    });

    // ── Inventory: ingredients, stock on hand, recipe costing ─────────────────
    Route::prefix('inventory')->name('inventory.')->group(function () {
        // Ingredient master data. Quantities and costs are shown here but owned by
        // `stock_levels`, so there is nothing to edit but name, unit and reorder level.
        Route::get('/ingredients', [IngredientController::class, 'index'])
            ->middleware('can.access:inventory.ingredients.view')->name('ingredients.index');
        Route::post('/ingredients', [IngredientController::class, 'store'])
            ->middleware('can.access:inventory.ingredients.create')->name('ingredients.store');
        Route::put('/ingredients/{id}', [IngredientController::class, 'update'])
            ->middleware('can.access:inventory.ingredients.update')->name('ingredients.update');
        Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy'])
            ->middleware('can.access:inventory.ingredients.delete')->name('ingredients.destroy');

        // Stock on hand plus the two corrections a kitchen makes. There is no
        // "add stock" route by design — value enters only via a goods receipt.
        Route::get('/stock', [StockController::class, 'index'])
            ->middleware('can.access:inventory.stock.view')->name('stock.index');
        Route::get('/stock/{ingredient}/ledger', [StockController::class, 'ledger'])
            ->middleware('can.access:inventory.stock.view')->name('stock.ledger');
        Route::post('/stock/adjust', [StockController::class, 'adjust'])
            ->middleware('can.access:inventory.stock.adjust')->name('stock.adjust');
        Route::post('/stock/write-off', [StockController::class, 'writeOff'])
            ->middleware('can.access:inventory.stock.adjust')->name('stock.write-off');

        // Recipe builder — dish cost is derived on read, never stored.
        Route::get('/recipes', [RecipeController::class, 'index'])
            ->middleware('can.access:inventory.recipes.view')->name('recipes.index');
        Route::put('/recipes/{foodItem}', [RecipeController::class, 'update'])
            ->middleware('can.access:inventory.recipes.update')->name('recipes.update');
    });

    // ── Procurement: vendors → purchase orders → goods receipts ───────────────
    Route::prefix('procurement')->name('procurement.')->group(function () {
        // Supplier master, shared with Expenses, Assets and Maintenance.
        Route::get('/vendors', [VendorController::class, 'index'])
            ->middleware('can.access:procurement.vendors.view')->name('vendors.index');
        Route::post('/vendors', [VendorController::class, 'store'])
            ->middleware('can.access:procurement.vendors.create')->name('vendors.store');
        Route::put('/vendors/{id}', [VendorController::class, 'update'])
            ->middleware('can.access:procurement.vendors.update')->name('vendors.update');
        Route::delete('/vendors/{id}', [VendorController::class, 'destroy'])
            ->middleware('can.access:procurement.vendors.delete')->name('vendors.destroy');

        // Purchase orders (draft → ordered → received). A commitment document:
        // nothing here moves stock or changes a cost.
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])
            ->middleware('can.access:procurement.purchase-orders.view')->name('purchase-orders.index');
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])
            ->middleware('can.access:procurement.purchase-orders.create')->name('purchase-orders.store');
        Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update'])
            ->middleware('can.access:procurement.purchase-orders.update')->name('purchase-orders.update');
        // Sending a PO commits the business to spend, hence its own permission.
        Route::put('/purchase-orders/{id}/order', [PurchaseOrderController::class, 'markOrdered'])
            ->middleware('can.access:procurement.purchase-orders.approve')->name('purchase-orders.order');
        Route::put('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel'])
            ->middleware('can.access:procurement.purchase-orders.update')->name('purchase-orders.cancel');
        Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy'])
            ->middleware('can.access:procurement.purchase-orders.delete')->name('purchase-orders.destroy');

        // Goods receipts — the only action in the system that raises stock and
        // re-values an ingredient, so it is append-only (no update, no delete).
        Route::get('/goods-receipts', [GoodsReceiptController::class, 'index'])
            ->middleware('can.access:procurement.goods-receipts.view')->name('goods-receipts.index');
        Route::post('/goods-receipts', [GoodsReceiptController::class, 'store'])
            ->middleware('can.access:procurement.goods-receipts.create')->name('goods-receipts.store');
        Route::post('/goods-receipts/receive-po/{id}', [GoodsReceiptController::class, 'receiveInFull'])
            ->middleware('can.access:procurement.goods-receipts.create')->name('goods-receipts.receive-po');
    });

    // ── Reports ───────────────────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        // Food cost & margin — live dish costing next to the COGS that was
        // snapshotted onto each sale.
        Route::get('/food-cost', [FoodCostReportController::class, 'index'])
            ->middleware('can.access:reports.food-cost.view')->name('food-cost');
    });

    // ── QR Codes (admin management pages) ─────────────────────
    Route::get('/qr-codes', [GuestMenuController::class, 'qrIndex'])
        ->middleware('can.access:qr.view')->name('qr-codes.index');
    Route::get('/qr-codes/{id}/image', [GuestMenuController::class, 'qrImage'])
        ->middleware('can.access:qr.view')->name('qr-codes.image');
    Route::post('/qr-codes', [GuestMenuController::class, 'qrStore'])
        ->middleware('can.access:qr.create')->name('qr-codes.store');
    Route::put('/qr-codes/{id}', [GuestMenuController::class, 'qrUpdate'])
        ->middleware('can.access:qr.update')->name('qr-codes.update');
    Route::delete('/qr-codes/{id}', [GuestMenuController::class, 'qrDestroy'])
        ->middleware('can.access:qr.delete')->name('qr-codes.destroy');

    // Account — profile + change password
    Route::get('/profile', [AccountController::class, 'profile'])
        ->middleware('can.access:profile.view')->name('profile');
    Route::put('/profile', [AccountController::class, 'updateProfile'])
        ->middleware('can.access:profile.update')->name('profile.update');
    Route::get('/change-password', [AccountController::class, 'changePasswordForm'])
        ->middleware('can.access:change-password.view')->name('change-password');
    Route::post('/change-password', [AccountController::class, 'changePassword'])
        ->middleware('can.access:change-password.update')->name('change-password.update');

    // WhatsApp chat/calls — retained real-time proxy (polled via fetch from the
    // Customers page; live polling can't be expressed as Inertia page props).
    Route::middleware('can.access:customers.view')->group(function () {
        Route::get('/whatsapp/status', [WhatsAppChatController::class, 'status']);
        Route::get('/whatsapp/conversations', [WhatsAppChatController::class, 'conversations']);
        Route::get('/whatsapp/messages/{number}', [WhatsAppChatController::class, 'messages']);
        Route::post('/whatsapp/send-message', [WhatsAppChatController::class, 'sendMessage']);
        Route::post('/whatsapp/send-image', [WhatsAppChatController::class, 'sendImage']);
        Route::post('/whatsapp/send-media', [WhatsAppChatController::class, 'sendMedia']);
        Route::get('/whatsapp/calls', [WhatsAppChatController::class, 'calls']);
        Route::post('/whatsapp/calls/{callId}/reject', [WhatsAppChatController::class, 'rejectCall']);
    });
});
