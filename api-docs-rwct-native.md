# GrillVibes Mobile POS API + React Native Build Guide

This document is for building a React Native mobile app that works like the web POS screen in this Laravel system.

> **API Base URL:** `http://127.0.0.1:8000/api` for API routes  
> **Web POS Reference:** `/pos` in the Laravel web app  
> **Data Format:** JSON, except image upload endpoints use `multipart/form-data`  
> **Auth:** Laravel Sanctum Bearer token only on protected API routes  
> **Main Mobile Goal:** cashier can log in, load menu, build cart, select order type/table/customer, choose KDS station, apply discount champion/running offer, apply promo code, redeem loyalty points, place order, and show the receipt after checkout.

---

## Important Backend Note

The current API routes support the core POS workflow, but several web POS features currently live only in web/Inertia routes. To build the React Native app exactly like the web POS, expose API endpoints for these features before or during mobile development.

| Web POS Feature | Current API Status | Needed for Exact Mobile Parity |
| --- | --- | --- |
| Menu items | Available through `GET /food-items` | OK |
| Categories | Available through `GET /food-categories` | OK |
| Places/tables | Available through `GET /places` | OK |
| Customers | Available through `GET /customers` | OK, but mobile should ideally have search |
| Place order | Available through `POST /orders` | OK |
| Receipt PNG | Available through `GET|POST /orders/{id}/receipt` | OK |
| Daily quick report | Available through `GET /daily-summary/quick-report` | OK |
| Top 10 report | Available through `GET /daily-summary/top-ten-deals-report` | OK |
| KDS station selection | API order payload accepts `kds_station_id` | Required: add endpoint to list active KDS stations |
| Promo code quote | Web-only `/orders/quote-promo` | Required: add API promo quote endpoint |
| Loyalty redemption | Web order controller supports it; API order controller does not | Required: add `redeem_points` support to API orders |
| Discount champion/running offers | Web POS receives campaigns as Inertia props | Required: add campaigns in POS bootstrap API |

For the full mobile app, build the core POS and also add API support for promo code, discount champion/running offers, redeem points, and KDS stations. These are required because the user wants the mobile app to behave like the web POS.

---

## React Native App Screens

### 1. Login Screen

Use:

```http
POST /api/login
```

Store the returned `token` securely using `expo-secure-store`, Keychain, or encrypted storage.

Fields:

| Field | Type | Required |
| --- | --- | --- |
| `email` | string | Yes |
| `password` | string | Yes |

Success:

```json
{
  "token": "1|plain-text-token",
  "message": "Login Success",
  "status": "success"
}
```

### 2. POS Home Screen

This is the main app screen, matching the web POS layout.

Mobile layout:

1. Category tabs at top.
2. Search box.
3. Menu item grid/list.
4. Cart button or bottom cart summary.
5. Cart screen/bottom sheet for checkout.

Load these on screen open:

```http
GET /api/food-categories
GET /api/food-items
GET /api/places
GET /api/customers
```

Recommended local state:

```ts
type CartLine = {
  fooditems_id: number;
  category_id: number;
  name: string;
  price: number;
  quantity: number;
  add_note: string;
  kds_station_id: number | null;
};

type PosForm = {
  type: "dining" | "delivery" | "on-way";
  place_id: number | "";
  customer_id: number | null;
  status: "pending" | "preparing" | "on-way" | "completed";
  paid: boolean;
  discount_type: "amount" | "percentage";
  discount_amount: number;
  service_charges_percentage: number;
  promo_code: string;
  redeem_points: number;
};
```

### 3. Cart / Checkout Screen

The mobile cart should support:

| Feature | Details |
| --- | --- |
| Increase/decrease quantity | Minimum quantity is `1` |
| Remove item | Delete cart line |
| Add note | Sent as `order_items[].add_note` |
| Select KDS station | Same as web POS: each cart line can use `Auto KDS station` or a selected station |
| Select order type | `dining`, `delivery`, `on-way` |
| Select table/place | Required as `place_id` |
| Select customer | Required for `delivery`; optional for `dining` and `on-way` |
| Set order status | Usually default `pending` |
| Payment status | `paid: true/false` |
| Manual discount | Fixed amount or percentage |
| Discount champion/running offer | Show campaign chips like web POS; tapping one fills manual discount amount |
| Promo code | Cashier enters code; app calls promo quote API and shows server-priced discount |
| Redeem points | Customer must be selected; app shows points balance and redemption limit |
| Service charge | Percentage |
| Complete order | Submit order, then immediately show receipt preview from `receipt_url` |

### Required Web POS Match Features

#### Promo Code

The mobile app must include a **Promo Code** field like web POS.

Flow:

1. Cashier types promo code.
2. App calls `GET /api/orders/quote-promo?code=<code>&subtotal=<subtotal>&customer_id=<customer_id>`.
3. App displays returned discount.
4. App sends only `promo_code` in the final order payload.
5. Backend calculates promo discount again when saving the order.

Do not let the mobile app invent promo discount amounts locally.

#### Discount Champion / Running Offers

The mobile app must show active discount campaigns as chips/buttons, like web POS running offers.

Expected behavior:

1. Load `campaigns` from `GET /api/pos/bootstrap`.
2. Calculate the campaign preview discount locally for display.
3. When cashier taps a campaign, set:

```ts
form.discount_type = "amount";
form.discount_amount = campaignDiscount;
```

This matches the web POS behavior: campaigns are suggestions, and tapping one fills the manual discount field.

#### Redeem Points

The mobile app must include **Redeem Points** when a customer is selected.

Expected behavior:

1. Customer search response must include `loyalty_points_balance`.
2. POS bootstrap must include loyalty settings.
3. App shows available points and max redeemable points.
4. App validates minimum and maximum points before checkout.
5. App sends `redeem_points` in order payload.
6. Backend calculates loyalty discount and updates points ledger.

#### KDS Station

Each cart line must include a KDS station picker like the web POS:

1. Default option: `Auto KDS station`.
2. Manual options: active stations from `GET /api/kds/stations`.
3. Send selected station as `order_items[].kds_station_id`.
4. Send `null` for auto-routing.

#### Show Receipt After Order Complete

After successful `POST /api/orders`:

1. Read `data.id` and `receipt_url` from the response.
2. Navigate to a `ReceiptPreviewScreen` or open a receipt modal.
3. Display the receipt image from `receipt_url`.
4. Provide buttons: `Print`, `Share`, `WhatsApp`, `New Order`.
5. If `receipt_url` is missing, call `GET /api/orders/{id}/receipt`.

### 4. Orders Screen

Use:

```http
GET /api/orders
GET /api/orders/{id}
DELETE /api/orders/{id}
```

Show order id, customer, type, status, paid/unpaid, grand total, and items.

### 5. Reports Screen

Use:

```http
GET /api/daily-summary/quick-report
GET /api/daily-summary/top-ten-deals-report
GET /api/daily-summary/report
GET /api/daily-summary/reportdelivery
GET /api/daily-summary/reportdining
GET /api/daily-summary/reportonway
GET /api/daily-category-sales/report
GET /api/daily-category-sales-by-item-quantity/reportcurrentdate
```

Optional query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `start_date` | date/datetime | Report start |
| `end_date` | date/datetime | Report end |
| `branch_id` | integer | Branch filter |

---

## Core POS Calculations

The React Native app should calculate the visible totals before submitting.

```ts
const subtotal = cart.reduce(
  (sum, line) => sum + Number(line.price) * Number(line.quantity),
  0
);

const manualDiscount =
  form.discount_type === "percentage"
    ? Math.min(subtotal, subtotal * (Number(form.discount_amount) / 100))
    : Math.min(subtotal, Number(form.discount_amount || 0));

const promoDiscount = Number(appliedPromo?.discount || 0);

const pointValue = Number(loyalty?.currency_per_point || 0);
const loyaltyDiscount = Number(form.redeem_points || 0) * pointValue;

const totalDiscount = manualDiscount + promoDiscount + loyaltyDiscount;

const taxable = Math.max(0, subtotal - totalDiscount);

const serviceCharges =
  taxable * (Number(form.service_charges_percentage || 0) / 100);

const grandTotal = Math.max(0, taxable + serviceCharges);

const totalQty = cart.reduce((sum, line) => sum + Number(line.quantity), 0);
```

Validation before submit:

1. Cart must not be empty.
2. `place_id` is required.
3. `customer_id` is required when `type === "delivery"`.
4. Manual discount must not exceed subtotal.
5. Manual discount + promo discount + loyalty discount must not exceed subtotal.
6. `service_charges_percentage` must be between `0` and `100`.
7. Promo codes must be priced by the backend quote API.
8. Redeem points must not exceed customer balance or the loyalty max redeem percent.

---

## Place Order API

```http
POST /api/orders
Accept: application/json
Content-Type: application/json
Authorization: Bearer <token>
```

> The current route list does not put `/orders` inside Sanctum middleware, but the mobile app can still send the token. If the backend later protects POS APIs, the app will already be ready.

### Request Body

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `device_id` | integer | No | WhatsApp device id; backend uses first device if omitted |
| `customer_id` | integer | Conditional | Required unless type is `dining` or `on-way` |
| `order_datetime` | string/date | Yes | Example: `2026-09-19 14:30:00` |
| `status` | string | Yes | `pending`, `preparing`, `on-way`, `completed` |
| `paid` | boolean | Yes | Payment status |
| `type` | string | No | `dining`, `delivery`, `on-way` |
| `qty` | integer | Yes | Total item quantity |
| `subtotal` | number | Yes | Before discount/service |
| `discount_type` | string | Yes | `amount` or `percentage` |
| `discount_amount` | number | Yes | Send the calculated discount amount in currency |
| `service_charges` | number | Yes | Calculated service charge amount |
| `service_charges_percentage` | number | Yes | 0 to 100, max 2 decimals |
| `grand_total` | number | Yes | Final total |
| `place_id` | integer | Yes | Table/place id |
| `promo_code` | string | No | Required for promo-code checkout; backend API must support it |
| `redeem_points` | integer | No | Required for loyalty checkout; backend API must support it |
| `order_items` | array | Yes | Cart lines |

Order item:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `fooditems_id` | integer | Yes | Food item id |
| `category_id` | integer | Yes | Food category id |
| `quantity` | integer | Yes | Minimum `1` |
| `discount_amount` | number | No | Usually `0` |
| `sub_total` | number | No | `price * quantity` |
| `add_note` | string | No | Kitchen note |
| `kds_station_id` | integer/null | No | Optional station id |

### Example Request

```json
{
  "customer_id": 1,
  "order_datetime": "2026-09-19 14:30:00",
  "status": "pending",
  "paid": false,
  "type": "delivery",
  "qty": 2,
  "subtotal": 1800,
  "discount_type": "amount",
  "discount_amount": 100,
  "service_charges": 85,
  "service_charges_percentage": 5,
  "grand_total": 1785,
  "place_id": 1,
  "promo_code": "FLAT100",
  "redeem_points": 0,
  "order_items": [
    {
      "fooditems_id": 1,
      "category_id": 1,
      "quantity": 2,
      "discount_amount": 0,
      "sub_total": 1800,
      "add_note": "No spice",
      "kds_station_id": null
    }
  ]
}
```

Success:

```json
{
  "status": "success",
  "message": "Order saved and receipt generated.",
  "data": {
    "id": 101,
    "customer_id": 1,
    "type": "delivery",
    "qty": 2,
    "subtotal": "1800.00",
    "discount_amount": "100.00",
    "service_charges": "85.00",
    "grand_total": "1785.00"
  },
  "receipt_media": {
    "id": 55,
    "order_id": 101,
    "file_path": "receipts/example.png",
    "type": "image/png"
  },
  "receipt_url": "http://127.0.0.1:8000/storage/receipts/example.png",
  "whatsapp_notification": "Receipt sent to customer via WhatsApp."
}
```

After success:

1. Clear cart.
2. Show success message with order id.
3. Navigate to `ReceiptPreviewScreen`.
4. Display `receipt_url` immediately.
5. If `receipt_url` is missing, call `GET /api/orders/{id}/receipt`.
6. Provide `Print`, `Share`, `WhatsApp`, and `New Order` actions.

---

## Receipt API

Generate or regenerate a receipt PNG:

```http
GET /api/orders/{id}/receipt
POST /api/orders/{id}/receipt
```

Optional query:

| Parameter | Type | Description |
| --- | --- | --- |
| `send` | boolean | Use `1` to send receipt over WhatsApp |

Example:

```http
GET /api/orders/101/receipt?send=1
```

Success:

```json
{
  "status": "success",
  "message": "Receipt generated.",
  "order_id": 101,
  "receipt_url": "http://127.0.0.1:8000/storage/receipts/example.png"
}
```

---

## Menu APIs

### Food Categories

```http
GET /api/food-categories
POST /api/food-categories
GET /api/food-categories/{id}
PUT /api/food-categories/{id}
DELETE /api/food-categories/{id}
```

Create/update fields:

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `status` | boolean | Yes |

### Food Items

```http
GET /api/food-items
POST /api/food-items
GET /api/food-items/{id}
PUT /api/food-items/{id}
DELETE /api/food-items/{id}
```

Food item fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `foodcategory_id` | integer | Yes | Existing category id |
| `name` | string | Yes | Item name |
| `image` | file | Yes on create | jpeg, png, jpg, gif, max 2048 KB |
| `description` | string | Yes | Item description |
| `code` | string | Yes | Unique item code |
| `price` | number | Yes | Minimum `0` |
| `status` | boolean | Yes | Active/inactive |

For POS item cards, use:

```ts
{
  id: number;
  name: string;
  price: string | number;
  image: string | null;
  foodcategory_id: number;
  status: boolean;
}
```

Filter mobile menu to active items only:

```ts
const activeItems = foodItems.filter(item => item.status === true || item.status === 1);
```

---

## Places / Tables API

```http
GET /api/places
POST /api/places
GET /api/places/{id}
PUT /api/places/{id}
DELETE /api/places/{id}
```

Create/update fields:

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `status` | boolean | Yes |

Use `place_id` when placing every order.

---

## Customers API

```http
GET /api/customers
POST /api/customers
GET /api/customers/{id}
PUT /api/customers/{id}
DELETE /api/customers/{id}
```

Create/update fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Customer name |
| `contact` | string | Yes | Phone number |
| `address` | string | Yes | Delivery address |
| `email` | string | No | Must be unique when present |
| `date_of_birth` | date | No | Optional |

Mobile usage:

1. For small customer tables, load all customers with `GET /api/customers`.
2. For production, add an API search endpoint like the web route `/customers/search?q=ali` to avoid loading thousands of customers.

Suggested mobile customer search endpoint to add:

```http
GET /api/customers/search?q=<name-or-phone>
```

Suggested response:

```json
[
  {
    "id": 1,
    "name": "Ali Khan",
    "contact": "03001234567",
    "loyalty_points_balance": 120
  }
]
```

---

## Auth and User APIs

### Register

```http
POST /api/register
```

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `email` | string | Yes |
| `password` | string | Yes |
| `password_confirmation` | string | Yes |

### Login

```http
POST /api/login
```

### Logout

```http
POST /api/logout
Authorization: Bearer <token>
```

### Logged User

```http
GET /api/logged-user
Authorization: Bearer <token>
```

### Update Profile

```http
POST /api/update-profile
Authorization: Bearer <token>
```

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `phone` | string | No |
| `address` | string | No |

### Change Password

```http
POST /api/change-password
Authorization: Bearer <token>
```

| Field | Type | Required |
| --- | --- | --- |
| `current_password` | string | Yes |
| `password` | string | Yes |
| `password_confirmation` | string | Yes |

---

## Password Reset APIs

Send reset OTP:

```http
POST /api/forgot-password
POST /api/send-reset-password-email
```

Body:

```json
{
  "email": "admin@example.com"
}
```

Reset password:

```http
POST /api/reset-password
POST /api/reset-password/{otp}
```

Body:

```json
{
  "email": "admin@example.com",
  "otp": "1234",
  "password": "newpassword",
  "password_confirmation": "newpassword"
}
```

---

## Settings API

```http
GET /api/settings
POST /api/settings
POST /api/settings/update
DELETE /api/settings/delete
```

Settings are useful for receipt branding.

Create fields:

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `logo` | file | Yes |
| `company` | string | Yes |
| `address` | string | Yes |
| `email` | string | Yes |
| `phone` | string | Yes |
| `message` | string | No |

---

## Reports API

### Quick Report Today

```http
GET /api/daily-summary/quick-report
```

Used by web POS "Quick Report - Today".

### Top 10 Deals Today

```http
GET /api/daily-summary/top-ten-deals-report
```

Used by web POS "Top 10 Deals - Today".

### Sales Summary

```http
GET /api/daily-summary/report
GET /api/daily-summary/reportdelivery
GET /api/daily-summary/reportdining
GET /api/daily-summary/reportonway
```

### Category Sales

```http
GET /api/daily-category-sales/report
GET /api/daily-category-sales-by-item-quantity/report
GET /api/daily-category-sales-by-item-quantity/reportcurrentdate
```

Common query parameters:

```http
?start_date=2026-09-19 00:00:00&end_date=2026-09-19 23:59:59&branch_id=1
```

---

## Required API Additions for Full Web POS Mobile App

Ask Claude/backend developer to add these API endpoints so the mobile app can match web POS exactly.

### 1. POS Bootstrap API

One call to load all mobile POS startup data, including discount champion/running offers, loyalty settings, and KDS stations:

```http
GET /api/pos/bootstrap
Authorization: Bearer <token>
```

Suggested response:

```json
{
  "foodItems": [],
  "categories": [],
  "places": [],
  "kdsStations": [],
  "loyalty": {
    "is_active": true,
    "points_per_currency": 0.1,
    "currency_per_point": 1,
    "min_redeem_points": 10,
    "max_redeem_percent": 30
  },
  "campaigns": []
}
```

Backend source to copy from: `App\Http\Controllers\Web\POSController@index`.

Campaign object should include:

```ts
type DiscountCampaign = {
  id: number;
  name: string;
  type: "amount" | "percentage";
  value: number;
  max_discount: number | null;
  min_order_amount: number;
  applies_to: "all" | "category" | "item";
  target_ids: number[];
  order_types: Array<"dining" | "delivery" | "on-way">;
};
```

### 2. Customer Search API

```http
GET /api/customers/search?q=<query>
```

Backend source to copy from: `App\Http\Controllers\Web\CustomerController@search`.

### 3. KDS Stations API

```http
GET /api/kds/stations
```

Response:

```json
[
  {
    "id": 1,
    "name": "Grill",
    "color": "#ef4444",
    "branch_id": 1
  }
]
```

### 4. Promo Quote API

```http
GET /api/orders/quote-promo?code=FLAT100&subtotal=1800&customer_id=1
```

Backend source to copy from: `App\Http\Controllers\Web\OrderController@quotePromo`.

Response:

```json
{
  "code": "FLAT100",
  "description": "Flat 100 off",
  "discount": 100
}
```

Mobile behavior:

1. Call this endpoint when the cashier taps `Apply`.
2. Show the returned discount below the promo field.
3. Re-quote when subtotal or selected customer changes.
4. Send `promo_code` during checkout, not the promo discount amount.

### 5. API Order Support for Promo and Loyalty

The web order controller accepts:

| Field | Type | Notes |
| --- | --- | --- |
| `promo_code` | string | Server calculates promo discount |
| `redeem_points` | integer | Server calculates loyalty discount |

The current API order controller validates only the core order fields. Add these fields to the API controller because the mobile app must support **Promo Code** and **Redeem Points** like web POS.

API order response should include the calculated values:

```json
{
  "data": {
    "id": 101,
    "discount_amount": "100.00",
    "promo_discount": "100.00",
    "loyalty_points_redeemed": 50,
    "loyalty_discount": "50.00",
    "service_charges": "77.50",
    "grand_total": "1627.50"
  },
  "receipt_url": "https://example.com/storage/receipts/101.png"
}
```

---

## React Native API Client Example

```ts
const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.message ||
      Object.values(data?.errors || {}).flat().join(" ") ||
      "Request failed";
    throw new Error(message);
  }

  return data;
}
```

Place order:

```ts
await apiFetch("/orders", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

---

## Suggested React Native Navigation

```txt
AuthStack
  Login
  ForgotPassword
  ResetPassword

AppTabs
  POS
  Orders
  Reports
  Customers
  Settings/Profile
```

Core POS components:

```txt
POSScreen
  CategoryTabs
  MenuSearch
  MenuGrid
  MenuItemCard
  CartSummaryBar
  CartBottomSheet
  CustomerPicker
  PlacePicker
  KdsStationPicker
  PromoCodeBox
  DiscountChampionChips
  RedeemPointsBox
  TotalsPanel
  ReceiptPreview
```

---

## Build Checklist for Claude

1. Create React Native app with TypeScript.
2. Add auth storage and API client.
3. Build login and password reset screens.
4. Build POS screen and load categories/items/places/customers.
5. Implement local cart and totals calculation.
6. Implement customer selection and delivery customer validation.
7. Implement KDS station picker per cart line.
8. Implement discount champion/running offer chips.
9. Implement promo code quote and apply flow.
10. Implement redeem points with customer balance and loyalty limits.
11. Submit `POST /api/orders`.
12. After order success, show receipt screen immediately using `receipt_url`.
13. Add orders list and order detail screens.
14. Add reports screen using daily report APIs.
15. Add offline/error states and pull-to-refresh.
16. Add backend APIs for POS bootstrap, KDS stations, customer search, promo quote, loyalty, and campaigns before final mobile delivery.

---

## Current API Route List

```php
GET    /api/places
POST   /api/places
GET    /api/places/{id}
PUT    /api/places/{id}
DELETE /api/places/{id}

GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}

POST   /api/register
POST   /api/login
POST   /api/forgot-password
POST   /api/send-reset-password-email
POST   /api/reset-password
POST   /api/reset-password/{otp}
POST   /api/logout
GET    /api/logged-user
POST   /api/update-profile
POST   /api/change-password
GET    /api/user

GET    /api/customers
POST   /api/customers
GET    /api/customers/{id}
PUT    /api/customers/{id}
DELETE /api/customers/{id}

GET    /api/food-categories
POST   /api/food-categories
GET    /api/food-categories/{id}
PUT    /api/food-categories/{id}
DELETE /api/food-categories/{id}

GET    /api/food-items
POST   /api/food-items
GET    /api/food-items/{id}
PUT    /api/food-items/{id}
DELETE /api/food-items/{id}

GET    /api/orders
GET    /api/deletereport
POST   /api/orders
GET    /api/orders/{id}/receipt
POST   /api/orders/{id}/receipt
GET    /api/orders/{id}
PUT    /api/orders/{id}
DELETE /api/orders/{id}

GET    /api/daily-summary/report
GET    /api/daily-summary/reportonway
GET    /api/daily-summary/reportdining
GET    /api/daily-summary/reportdelivery
GET    /api/daily-category-sales/report
GET    /api/daily-category-sales-by-item-quantity/report
GET    /api/daily-category-sales-by-item-quantity/reportcurrentdate
GET    /api/daily-summary/quick-report
GET    /api/daily-summary/top-ten-deals-report

GET    /api/settings
POST   /api/settings
POST   /api/settings/update
DELETE /api/settings/delete
```
