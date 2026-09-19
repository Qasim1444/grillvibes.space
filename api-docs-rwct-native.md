# GrillVibes API — RWCT Native App Documentation

> **Base URL:** `http://127.0.0.1:8000/api` (replace with production URL)  
> **Format:** JSON  
> **Auth Type:** Laravel Sanctum Bearer Token  
> **Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
   - [Login](#login)
   - [Register](#register)
   - [Logout](#logout)
   - [Get Logged User](#get-logged-user)
   - [Update Profile](#update-profile)
   - [Change Password](#change-password)
2. [Orders](#orders)
   - [Create Order](#create-order)
   - [List Orders](#list-orders)
   - [Get Order](#get-order)
   - [Update Order](#update-order)
   - [Delete Order](#delete-order)
   - [Generate Receipt](#generate-receipt)
3. [Customers](#customers)
4. [Food Menu](#food-menu)
5. [Places](#places)
6. [Guest QR Ordering](#guest-qr-ordering)

---

## General Response Format

### Success

```json
{
  "status": "success",
  "message": "Operation completed.",
  "data": { }
}
```

### Error

```json
{
  "message": "Error description",
  "status": "failed"
}
```

### Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

---

## Authentication

All endpoints under `/api` except those explicitly marked public require a valid Sanctum token in the `Authorization` header for protected routes.

---

### Login

Authenticates a user and returns a Sanctum API token.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/login`                  |
| **Auth**     | No (public)                        |
| **Description** | Authenticates user by email and password; returns a plain-text Sanctum token for subsequent API calls. |

#### Request Body

| Field     | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| `email`   | string | Yes      | User email address   |
| `password`| string | Yes      | User password        |

#### Example Request

```http
POST /api/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "email": "admin@grillvibes.space",
  "password": "password123"
}
```

#### Success Response (`200 OK`)

```json
{
  "token": "2|abc123def456ghi789...",
  "message": "Login Success",
  "status": "success"
}
```

#### Error Response (`401 Unauthorized`)

```json
{
  "message": "The Provided Credentials are incorrect",
  "status": "failed"
}
```

---

### Register

Creates a new user account and returns a Sanctum API token.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/register`               |
| **Auth**     | No (public)                        |
| **Description** | Registers a new user, generates an API token. |

#### Request Body

| Field     | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `name`    | string | Yes      | Full name                    |
| `email`   | string | Yes      | Email address (must be unique)|
| `password`| string | Yes      | Password (min 6 chars, must be confirmed) |

#### Example Request

```http
POST /api/register HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

#### Success Response (`201 Created`)

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "password": null,
    "created_at": "2024-01-15T10:00:00.000000Z",
    "updated_at": "2024-01-15T10:00:00.000000Z"
  },
  "message": "Registration Success",
  "status": "success"
}
```

#### Error Response (Email exists — `200 OK`)

```json
{
  "message": "Email already exists",
  "status": "failed"
}
```

---

### Logout

Revokes the current user's Sanctum token(s). Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/logout`                 |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Logs out the current user by deleting all their tokens. |

#### Example Request

```http
POST /api/logout HTTP/1.1
Authorization: Bearer 2|abc123def456...
Content-Type: application/json
Accept: application/json
```

#### Success Response (`200 OK`)

```json
{
  "message": "Logout Success",
  "status": "success"
}
```

---

### Get Logged User

Returns the currently authenticated user's data. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `GET /api/logged-user`             |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Fetches profile data of the logged-in user. |

#### Example Request

```http
GET /api/logged-user HTTP/1.1
Authorization: Bearer 2|abc123def456...
Accept: application/json
```

#### Success Response (`200 OK`)

```json
{
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", ... },
  "message": "Logged User Data",
  "status": "success"
}
```

---

### Update Profile

Updates the authenticated user's profile information. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/update-profile`         |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Updates name, phone, and address of the logged-in user. |

#### Request Body

| Field     | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| `name`    | string | Yes      | Full name (max 255)        |
| `phone`   | string | No       | Phone number (max 50)      |
| `address` | string | No       | Address (max 1000)         |

#### Example Request

```http
POST /api/update-profile HTTP/1.1
Authorization: Bearer 2|abc123def456...
Content-Type: application/json
Accept: application/json

{
  "name": "John Doe Updated",
  "phone": "+923001234567",
  "address": "123 Main Street, Lahore"
}
```

#### Success Response (`200 OK`)

```json
{
  "user": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+923001234567",
    "address": "123 Main Street, Lahore",
    "created_at": "2024-01-15T10:00:00.000000Z"
  },
  "message": "Profile updated successfully.",
  "status": "success"
}
```

---

### Change Password

Changes the authenticated user's password. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/change-password`        |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Changes password after verifying the current password. |

#### Request Body

| Field              | Type   | Required | Description                          |
| ------------------ | ------ | -------- | ------------------------------------ |
| `current_password` | string | Yes      | Current password                     |
| `password`         | string | Yes      | New password (min 8 chars, confirmed)|

#### Example Request

```http
POST /api/change-password HTTP/1.1
Authorization: Bearer 2|abc123def456...
Content-Type: application/json
Accept: application/json

{
  "current_password": "oldpass123",
  "password": "newpass123",
  "password_confirmation": "newpass123"
}
```

#### Success Response (`200 OK`)

```json
{
  "message": "Password changed successfully.",
  "status": "success"
}
```

#### Error Response (`403 Forbidden`)

```json
{
  "message": "Current password is incorrect.",
  "status": "error"
}
```

---

## Orders

Order management endpoints. The `POST /api/orders` endpoint is the primary order creation endpoint used by the RWCT native app. It handles order creation, stock deduction (via recipe costing), receipt PNG generation, and optional WhatsApp delivery.

---

### Create Order

Creates a new order with items, deducts stock based on recipes, generates a receipt image, and optionally sends it via WhatsApp. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /api/orders`                 |
| **Auth**     | Yes (`Bearer` token)               |
| **Method**   | `POST`                             |
| **Description** | Places a new order: validates items, deducts inventory stock atomically, generates a PNG receipt, and optionally sends it via WhatsApp to the customer. |

#### Request Body

| Field                        | Type      | Required | Description                                     |
| ---------------------------- | --------- | -------- | ----------------------------------------------- |
| `customer_id`                | integer   | Conditional* | Customer ID (required unless `type` is `dining` or `on-way`). Must exist in `customers` table. |
| `device_id`                  | integer   | No       | WhatsApp device ID (auto-assigned if omitted).  |
| `order_datetime`             | string    | Yes      | Order datetime (ISO 8601 date).                 |
| `status`                     | string    | Yes      | Order status (e.g., `pending`, `processing`).   |
| `paid`                       | boolean   | Yes      | Whether the order is paid.                      |
| `type`                       | string    | No       | Order type: `dining`, `delivery`, or `on-way`.  |
| `qty`                        | integer   | Yes      | Total quantity (min 1).                         |
| `subtotal`                   | number    | Yes      | Subtotal amount (min 0).                        |
| `discount_type`              | string    | Yes      | `amount` or `percentage`.                       |
| `discount_amount`            | number    | Yes      | Discount value (min 0).                         |
| `service_charges`            | number    | Yes      | Service charges (min 0).                        |
| `service_charges_percentage` | number    | Yes      | Service charge % (0-100, 2 decimal places).     |
| `grand_total`                | number    | Yes      | Grand total (min 0).                            |
| `place_id`                   | integer   | Yes      | Place/outlet ID.                                |
| `order_items`                | array     | Yes      | Array of order line items (see below).          |

##### Order Item (in `order_items` array)

| Field              | Type    | Required | Description                              |
| ------------------ | ------- | -------- | ---------------------------------------- |
| `fooditems_id`     | integer | Yes      | Food item ID (must exist in `food_items`).|
| `category_id`      | integer | Yes      | Food category ID.                        |
| `quantity`         | integer | Yes      | Quantity of this item (min 1).           |
| `discount_amount`  | number  | No       | Discount for this line item.             |
| `sub_total`        | number  | No       | Line item subtotal.                      |
| `add_note`         | string  | No       | Special instruction / note.              |
| `kds_station_id`   | integer | No       | Kitchen display station ID (auto-routed if omitted). |

#### Example Request

```http
POST /api/orders HTTP/1.1
Authorization: Bearer 2|abc123def456...
Content-Type: application/json
Accept: application/json

{
  "customer_id": 1,
  "order_datetime": "2024-01-15T12:30:00",
  "status": "pending",
  "paid": false,
  "type": "dining",
  "qty": 3,
  "subtotal": 1500.00,
  "discount_type": "amount",
  "discount_amount": 100.00,
  "service_charges": 50.00,
  "service_charges_percentage": 10.00,
  "grand_total": 1450.00,
  "place_id": 1,
  "order_items": [
    {
      "fooditems_id": 1,
      "category_id": 1,
      "quantity": 2,
      "discount_amount": 0,
      "sub_total": 800.00,
      "add_note": "No onions please",
      "kds_station_id": null
    },
    {
      "fooditems_id": 2,
      "category_id": 1,
      "quantity": 1,
      "discount_amount": 0,
      "sub_total": 700.00,
      "add_note": "",
      "kds_station_id": 1
    }
  ]
}
```

#### Success Response (`201 Created`)

```json
{
  "status": "success",
  "message": "Order saved and receipt generated.",
  "data": {
    "id": 1,
    "customer_id": 1,
    "order_datetime": "2024-01-15T12:30:00.000000Z",
    "status": "pending",
    "paid": false,
    "type": "dining",
    "grand_total": 1450.00,
    "place_id": 1,
    "created_at": "2024-01-15T12:30:00.000000Z"
  },
  "receipt_media": {
    "id": 1,
    "order_id": 1,
    "file_path": "receipts/abc123.png",
    "type": "image/png",
    "uploaded_at": "2024-01-15T12:30:01.000000Z"
  },
  "receipt_url": "http://127.0.0.1:8000/storage/receipts/abc123.png",
  "whatsapp_notification": "Receipt sent to customer via WhatsApp."
}
```

#### Error Response (`422 Unprocessable Entity`)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "order_items.0.fooditems_id": ["The selected fooditems id is invalid."],
    "place_id": ["The place id field is required."]
  }
}
```

---

### List Orders

Returns all orders with their items and customer details. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `GET /api/orders`                  |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Fetches all orders with order items and customer info. |

#### Example Request

```http
GET /api/orders HTTP/1.1
Authorization: Bearer 2|abc123def456...
Accept: application/json
```

#### Success Response (`200 OK`)

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "customer": { "id": 1, "name": "John", "address": "123 St", "contact": "03001234567" },
      "order_items": [
        { "id": 1, "fooditems_id": 1, "quantity": 2, "sub_total": 800.00 }
      ]
    }
  ],
  "total_orders": 1
}
```

---

### Get Order

Returns a single order by ID with its items. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `GET /api/orders/{id}`             |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Fetches a specific order with its order items. |

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Order ID    |

#### Example Request

```http
GET /api/orders/1 HTTP/1.1
Authorization: Bearer 2|abc123def456...
Accept: application/json
```

#### Success Response (`200 OK`)

```json
{
  "id": 1,
  "customer_id": 1,
  "status": "pending",
  "paid": false,
  "order_items": [
    { "id": 1, "fooditems_id": 1, "category_id": 1, "quantity": 2, "discount_amount": 0, "sub_total": 800.00, "add_note": "No onions" }
  ],
  "created_at": "2024-01-15T12:30:00.000000Z"
}
```

---

### Update Order

Updates an existing order. Reverses previous stock deductions and re-applies new ones atomically. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `PUT /api/orders/{id}`             |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Edits an order: reverses old stock consumption, updates the order, syncs order items, and re-consumes stock. |

#### Request Body

Same structure as [Create Order](#create-order). The `order_items` array replaces all existing items if provided.

#### Success Response (`200 OK`)

```json
{
  "id": 1,
  "customer_id": 1,
  "status": "processing",
  "paid": true,
  "order_items": [
    { "id": 1, "fooditems_id": 1, "quantity": 3, "sub_total": 1200.00 }
  ]
}
```

---

### Delete Order

Soft-deletes an order and reverses stock deductions. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `DELETE /api/orders/{id}`          |
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Voids an order: returns ingredients to stock, deletes order items, soft deletes the order. |

#### Example Request

```http
DELETE /api/orders/1 HTTP/1.1
Authorization: Bearer 2|abc123def456...
Accept: application/json
```

#### Success Response (`200 OK`)

```json
{
  "status": "success",
  "message": "Order deleted successfully"
}
```

#### Error Response (`500 Internal Server Error`)

```json
{
  "status": "error",
  "message": "Failed to delete order",
  "error": "Error message"
}
```

---

### Generate Receipt

Generates a PNG receipt for an order. Optionally resends it via WhatsApp. Requires authentication.

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `GET|POST /api/orders/{id}/receipt`|
| **Auth**     | Yes (`Bearer` token)               |
| **Description** | Regenerates receipt PNG. Pass `?send=1` to also send via WhatsApp. |

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | Order ID    |

#### Query Parameters

| Parameter | Type    | Required | Description                              |
| --------- | ------- | -------- | ---------------------------------------- |
| `send`    | boolean | No       | Set to `1` or `true` to resend via WhatsApp. |

#### Success Response (`201 Created`)

```json
{
  "status": "success",
  "message": "Receipt generated.",
  "order_id": 1,
  "receipt_media": { "id": 2, "file_path": "receipts/def456.png", "type": "image/png" },
  "receipt_url": "http://127.0.0.1:8000/storage/receipts/def456.png"
}
```

---

## Customers

Customer CRUD operations. Some endpoints require authentication (check middleware in `routes/api.php`).

### List Customers

| **URL**   | `GET /api/customers`               |
| --------- | ---------------------------------- |
| **Auth**  | Yes                                |

#### Success Response

```json
[
  { "id": 1, "name": "John", "address": "123 St", "contact": "03001234567", "email": "john@example.com" }
]
```

### Create Customer

| **URL**   | `POST /api/customers`              |
| --------- | ---------------------------------- |
| **Auth**  | Yes                                |

| Field     | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| `name`    | string | Yes      | Customer name        |
| `contact` | string | No       | Phone number         |
| `email`   | string | No       | Email address        |
| `address` | string | No       | Address              |

### Get Customer

| **URL**   | `GET /api/customers/{id}`          |
| --------- | ---------------------------------- |
| **Auth**  | Yes                                |

### Update Customer

| **URL**   | `PUT /api/customers/{id}`          |
| --------- | ---------------------------------- |
| **Auth**  | Yes                                |

### Delete Customer

| **URL**   | `DELETE /api/customers/{id}`       |
| --------- | ---------------------------------- |
| **Auth**  | Yes                                |

---

## Food Menu

### List Food Categories

| **URL**   | `GET /api/food-categories`         |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

#### Success Response

```json
[
  { "id": 1, "name": "Grills", "status": true, "slug": "grills" },
  { "id": 2, "name": "Drinks", "status": true, "slug": "drinks" }
]
```

### List Food Items

| **URL**   | `GET /api/food-items`              |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

#### Success Response

```json
[
  {
    "id": 1,
    "foodcategory_id": 1,
    "name": "Chicken Biryani",
    "description": "Spicy biryani with chicken",
    "code": "BRY-001",
    "price": 800.00,
    "image": null,
    "status": true
  }
]
```

### Create Food Item

| **URL**   | `POST /api/food-items`             |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

| Field       | Type    | Required | Description             |
| ----------- | ------- | -------- | ----------------------- |
| `foodcategory_id` | integer | Yes | Category ID       |
| `name`      | string  | Yes      | Item name               |
| `description`| string | No       | Description             |
| `code`      | string  | No       | Item code               |
| `price`     | number  | No       | Price (2 decimals)      |
| `image`     | string  | No       | Image path              |
| `status`    | boolean | No       | Active/inactive         |

### Get Food Item

| **URL**   | `GET /api/food-items/{id}`         |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

### Update Food Item

| **URL**   | `PUT /api/food-items/{id}`         |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

### Delete Food Item

| **URL**   | `DELETE /api/food-items/{id}`      |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

---

## Places

Manage dining places / outlets.

### List Places

| **URL**   | `GET /api/places`                  |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

#### Success Response

```json
[
  { "id": 1, "name": "Main Branch", "address": "..." }
]
```

### Create Place

| **URL**   | `POST /api/places`                 |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

### Get Place

| **URL**   | `GET /api/places/{id}`             |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

### Update Place

| **URL**   | `PUT /api/places/{id}`             |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

### Delete Place

| **URL**   | `DELETE /api/places/{id}`          |
| --------- | ---------------------------------- |
| **Auth**  | Check middleware                   |

---

## Guest QR Ordering

Public endpoints for guest/QR-based ordering. No Sanctum auth — uses `session_token` in request body.

### Scan QR Code

| **URL**   | `GET /api/guest/qr/{slug}`         |
| --------- | ---------------------------------- |
| **Auth**  | No (public)                        |
| **Description** | Scans a QR code, creates a session, returns the menu for that place. |

### Browse Menu

| **URL**   | `GET /api/guest/menu`              |
| --------- | ---------------------------------- |
| **Auth**  | No (public)                        |
| **Description** | Returns the full menu for browsing. |

### Save Cart

| **URL**   | `POST /api/guest/cart`             |
| --------- | ---------------------------------- |
| **Auth**  | No (public)                        |
| **Body**  | Requires `session_token` in body   |
| **Description** | Saves cart items for a guest session. |

### Place Order (Guest)

| **URL**   | `POST /api/guest/order`            |
| --------- | ---------------------------------- |
| **Auth**  | No (public)                        |
| **Body**  | Requires `session_token` in body   |
| **Description** | Places an order from the saved guest cart. |

### Get Order Status

| **URL**   | `GET /api/guest/order/{orderId}/status` |
| --------- | --------------------------------------- |
| **Auth**  | No (public)                             |
| **Description** | Polls the status of a guest order. |

---

## Authentication Summary

| Endpoint                        | Method | Auth Required |
| -------------------------------- | ------ | ------------- |
| `/api/login`                     | POST   | No            |
| `/api/register`                  | POST   | No            |
| `/api/logout`                    | POST   | Yes           |
| `/api/logged-user`               | GET    | Yes           |
| `/api/update-profile`            | POST   | Yes           |
| `/api/change-password`           | POST   | Yes           |
| `/api/orders`                    | POST   | Yes           |
| `/api/orders`                    | GET    | Yes           |
| `/api/orders/{id}`               | GET    | Yes           |
| `/api/orders/{id}`               | PUT    | Yes           |
| `/api/orders/{id}`               | DELETE | Yes           |
| `/api/orders/{id}/receipt`       | GET/POST | Yes         |
| `/api/customers`                 | CRUD   | Yes           |
| `/api/food-categories`           | CRUD   | Yes           |
| `/api/food-items`                | CRUD   | Yes           |
| `/api/places`                    | CRUD   | Yes           |
| `/api/guest/*`                   | Various | No          |

---

## Notes for RWCT Native App Integration

1. **Token Storage**: Store the Sanctum token securely after login (e.g., Keychain on iOS, EncryptedSharedPreferences on Android).
2. **Authorization Header**: Include `Authorization: Bearer <token>` on all authenticated requests.
3. **Content-Type**: Always send `Content-Type: application/json` and `Accept: application/json`.
4. **Order Creation**: The `POST /api/orders` endpoint performs stock deduction atomically inside a database transaction. If stock is insufficient, the entire operation fails and no stock is deducted.
5. **Receipt**: After creating an order, the response includes a `receipt_url` pointing to the generated PNG receipt.
6. **WhatsApp**: If the order has a customer with a contact number, the receipt is automatically sent via WhatsApp. To suppress this, omit or ensure the customer has no contact info.
7. **Guest Ordering**: For QR-based self-ordering, use the `/api/guest/*` endpoints (no auth required).
8. **Pagination**: List endpoints currently return all records. Implement pagination on the backend if data grows large.
9. **API Base URL**: Configure via environment variable or app settings; default is `http://127.0.0.1:8000/api`.
