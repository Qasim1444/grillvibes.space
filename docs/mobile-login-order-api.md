# Mobile Login and Order API

Use this document when building the Android native app. All endpoints are JSON unless noted.

## Base URL

Production:

```text
https://your-domain.com/api
```

Local example:

```text
http://127.0.0.1:8000/api
```

## Headers

For JSON requests:

```http
Accept: application/json
Content-Type: application/json
```

For protected endpoints after login:

```http
Authorization: Bearer {token}
```

At the moment, the login/profile/logout endpoints use Sanctum token auth. The order endpoints are currently public in `routes/api.php`, but the Android app should still send the bearer token if it has one so the API can be protected later without changing the client shape.

## Login

### POST `/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Success response, HTTP `200`:

```json
{
  "token": "1|plain-text-sanctum-token",
  "message": "Login Success",
  "status": "success"
}
```

Failed response, HTTP `401`:

```json
{
  "message": "The Provided Credentials are incorrect",
  "status": "failed"
}
```

Validation errors return HTTP `422` with Laravel's `errors` object.

## Logged-In User

### GET `/logged-user`

Requires:

```http
Authorization: Bearer {token}
```

Success response, HTTP `200`:

```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com"
  },
  "message": "Logged User Data",
  "status": "success"
}
```

## Logout

### POST `/logout`

Requires:

```http
Authorization: Bearer {token}
```

Success response, HTTP `200`:

```json
{
  "message": "Logout Success",
  "status": "success"
}
```

## Lookup APIs Needed Before Ordering

### GET `/customers`

Returns all customers.

Customer `id` is required for delivery orders. For `dining` and `on-way`, `customer_id` is optional by validation.

### POST `/customers`

Create a customer.

Request:

```json
{
  "name": "Walk In Customer",
  "contact": "03001234567",
  "address": "Lahore",
  "email": "customer@example.com",
  "date_of_birth": "1995-01-15"
}
```

Required fields:

- `name`
- `contact`
- `address`

### GET `/places`

Returns all tables/places. Use `place_id` when creating an order.

### GET `/food-categories`

Returns all food categories.

### GET `/food-items`

Returns all food items with category information.

Important fields:

```json
{
  "id": 10,
  "foodcategory_id": 3,
  "foodcategory_name": "Burgers",
  "name": "Zinger Burger",
  "price": "550.00",
  "status": 1
}
```

Use:

- `id` as `order_items.*.fooditems_id`
- `foodcategory_id` as `order_items.*.category_id`
- `price` to calculate subtotal in the app

## Orders

### GET `/orders`

Returns:

```json
{
  "status": "success",
  "data": [
    {
      "id": 101,
      "customer_id": 1,
      "order_datetime": "2026-09-23T12:30:00.000000Z",
      "status": "pending",
      "paid": false,
      "type": "dining",
      "qty": 2,
      "subtotal": "1100.00",
      "discount_type": "amount",
      "discount_amount": "0.00",
      "service_charges_percentage": "0.00",
      "service_charges": "0.00",
      "grand_total": "1100.00",
      "place_id": 1,
      "order_items": []
    }
  ],
  "total_orders": 1
}
```

### POST `/orders`

Creates an order, creates order items, consumes stock, generates a receipt PNG, and tries to send the receipt on WhatsApp if the customer has a contact number.

Important: do not send `device_id`. It has been removed from orders.

Request:

```json
{
  "customer_id": 1,
  "order_datetime": "2026-09-23T12:30:00+05:00",
  "status": "pending",
  "paid": false,
  "type": "dining",
  "qty": 2,
  "subtotal": 1100,
  "discount_type": "amount",
  "discount_amount": 0,
  "service_charges_percentage": 0,
  "service_charges": 0,
  "grand_total": 1100,
  "place_id": 1,
  "order_items": [
    {
      "fooditems_id": 10,
      "category_id": 3,
      "quantity": 2,
      "discount_amount": 0,
      "sub_total": 1100,
      "add_note": "No onions",
      "kds_station_id": null
    }
  ]
}
```

Required order fields:

- `order_datetime`: any valid date/time string. Prefer ISO 8601 with timezone from Android.
- `status`: string, for example `pending` or `completed`
- `paid`: boolean
- `type`: `dining`, `delivery`, or `on-way`
- `qty`: total quantity of all items
- `subtotal`: order subtotal before service charges
- `discount_type`: `amount` or `percentage`
- `discount_amount`: numeric
- `service_charges`: numeric
- `service_charges_percentage`: numeric from `0` to `100`, max 2 decimals
- `grand_total`: final total
- `place_id`: valid place/table id
- `order_items`: array with at least one item

Required item fields:

- `fooditems_id`: valid food item id
- `category_id`: category id for the food item
- `quantity`: integer, minimum `1`

Optional item fields:

- `discount_amount`
- `sub_total`
- `add_note`
- `kds_station_id`

Success response, HTTP `201`:

```json
{
  "status": "success",
  "message": "Order saved and receipt generated.",
  "data": {
    "id": 101,
    "customer_id": 1,
    "order_datetime": "2026-09-23 12:30:00",
    "status": "pending",
    "paid": false,
    "type": "dining",
    "qty": 2,
    "subtotal": 1100,
    "grand_total": 1100,
    "place_id": 1,
    "branch_id": 1,
    "order_items": []
  },
  "receipt_media": {
    "id": 55,
    "order_id": 101,
    "file_path": "receipts/receipt_101_1790152200.png",
    "type": "image/png"
  },
  "receipt_url": "https://your-domain.com/storage/receipts/receipt_101_1790152200.png"
}
```

If WhatsApp sending fails, the order is still saved. The response message changes and may include `whatsapp_error`.

### GET `/orders/{id}`

Returns one order with its `order_items`.

### PUT `/orders/{id}`

Updates the order and replaces order items when `order_items` is provided. The request body shape is the same as `POST /orders`.

### DELETE `/orders/{id}`

Soft-deletes the order and reverses stock consumption.

Success response:

```json
{
  "status": "success",
  "message": "Order deleted successfully"
}
```

## Receipt API

### GET `/orders/{id}/receipt`

Regenerates receipt PNG and returns URL.

### POST `/orders/{id}/receipt?send=1`

Regenerates receipt and sends it on WhatsApp when the customer has a contact number.

Success response, HTTP `201`:

```json
{
  "status": "success",
  "message": "Receipt generated.",
  "order_id": 101,
  "receipt_media": {
    "id": 56,
    "order_id": 101,
    "file_path": "receipts/receipt_101_1790152400.png",
    "type": "image/png"
  },
  "receipt_url": "https://your-domain.com/storage/receipts/receipt_101_1790152400.png"
}
```

## Android Calculation Notes

Before calling `POST /orders`, calculate:

```text
qty = sum(order_items.quantity)
subtotal = sum(order_items.sub_total)
service_charges = (subtotal - discount_amount) * service_charges_percentage / 100
grand_total = subtotal - discount_amount + service_charges
```

For each line:

```text
sub_total = item.price * quantity - line_discount
```

Send numbers as JSON numbers, not formatted strings with commas.

## Android Kotlin Example

Login request body:

```kotlin
val body = mapOf(
    "email" to email,
    "password" to password
)
```

Save the returned `token`, then send:

```http
Authorization: Bearer 1|plain-text-sanctum-token
```

Order request body shape:

```kotlin
val order = mapOf(
    "customer_id" to customerId,
    "order_datetime" to OffsetDateTime.now().toString(),
    "status" to "pending",
    "paid" to false,
    "type" to "dining",
    "qty" to totalQty,
    "subtotal" to subtotal,
    "discount_type" to "amount",
    "discount_amount" to discount,
    "service_charges_percentage" to serviceChargePercent,
    "service_charges" to serviceChargeAmount,
    "grand_total" to grandTotal,
    "place_id" to placeId,
    "order_items" to items
)
```

## Common HTTP Codes

- `200`: success
- `201`: created
- `401`: invalid login or missing/invalid bearer token on protected routes
- `404`: item/order/customer/place not found
- `422`: validation failed
- `500`: server error

## Current Public API Routes Related to Mobile Ordering

```text
POST   /api/login
POST   /api/logout
GET    /api/logged-user

GET    /api/customers
POST   /api/customers
GET    /api/places
GET    /api/food-categories
GET    /api/food-items

GET    /api/orders
POST   /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}
DELETE /api/orders/{id}
GET    /api/orders/{id}/receipt
POST   /api/orders/{id}/receipt?send=1
```
