# GrillVibes Rider App API Guide

This document is for building a delivery rider mobile app for the existing GrillVibes Laravel backend.

> **API Base URL:** `https://your-domain.com/api` in production  
> **Local Base URL:** `http://127.0.0.1:8000/api`  
> **Auth:** Laravel Sanctum bearer token  
> **Current backend status:** rider assignment, delivery status tracking, location update, delivery proof, COD collection, and history APIs have been added.

---

## Rider App Goal

The rider app should let a delivery rider:

1. Log in.
2. See assigned delivery orders.
3. Open order/customer/address details.
4. Accept or reject an assigned delivery.
5. Mark order as picked up.
6. Mark order as on the way.
7. Mark order as delivered.
8. Optionally call or WhatsApp the customer.
9. Optionally upload delivery proof.
10. View completed delivery history.

---

## Important Backend Gap

The current backend has orders with:

- `customer_id`
- `type`
- `status`
- `paid`
- `place_id`
- `branch_id`
- totals
- order items

The rider backend adds these order fields:

- `rider_id`
- `delivery_status`
- `assigned_at`
- `accepted_at`
- `picked_up_at`
- `on_way_at`
- `delivered_at`
- `delivery_notes`
- `delivery_rejection_reason`
- `delivery_proof_path`
- `cash_collected`

It also adds rider location/profile fields on users.

---

## Existing APIs The Rider App Can Use Now

## React Native Design API Map

Use these endpoints for the app design screens you shared.

| Screen | API |
| --- | --- |
| Splash | No API, check saved token |
| Onboarding | No API, local app screen |
| Login | `POST /api/login` |
| Home / Orders | `GET /api/rider/home` |
| New Orders tab | `GET /api/rider/orders?status=assigned` |
| My Orders tab | `GET /api/rider/orders?status=accepted`, `picked_up`, or `on_way` |
| Order Details | `GET /api/rider/orders/{order}` |
| Accept Order | `POST /api/rider/orders/{order}/accept` |
| Picked Up | `POST /api/rider/orders/{order}/picked-up` |
| On Way / Live Map | `GET /api/rider/orders/{order}/tracking` and `POST /api/rider/location` |
| Delivered | `POST /api/rider/orders/{order}/delivered` |
| Order History | `GET /api/rider/history` |
| Rider Earnings | `GET /api/rider/earnings?period=daily` |
| Live Tracking tab | `GET /api/rider/orders/{order}/tracking` |
| Rider Profile | `GET /api/rider/profile` |
| Update Profile | `POST /api/rider/profile` |
| Settings | `GET /api/rider/settings` |
| Notifications | `GET /api/rider/notifications` |

### Home / Orders Screen

```http
GET /api/rider/home
```

Use this for the screen with the GrillVibes Rider header, online status, New Orders, My Orders, and History tabs.

Response shape:

```json
{
  "status": "success",
  "data": {
    "rider": {
      "id": 7,
      "name": "Ahmed Raza",
      "phone": "923001234567",
      "vehicle_type": "Bike",
      "vehicle_number": "LEA-1234",
      "is_available": true,
      "last_lat": 31.5204,
      "last_lng": 74.3587
    },
    "summary": {
      "new_orders": 4,
      "active_orders": 1,
      "today_delivered": 8,
      "today_earnings": 2450
    },
    "tabs": {
      "new_orders": [],
      "my_orders": [],
      "history_preview": []
    }
  }
}
```

Each order card includes:

```json
{
  "id": 1025,
  "order_code": "#GRV-1025",
  "delivery_status": "assigned",
  "delivery_status_label": "Assigned",
  "payment_label": "Cash on Delivery",
  "grand_total": 1850,
  "grand_total_formatted": "Rs 1,850",
  "earning": 185,
  "earning_formatted": "Rs 185",
  "distance_text": "2.5 km",
  "eta_text": "8 min",
  "items_count": 3,
  "customer": {
    "name": "Ali Khan",
    "contact": "923001234567",
    "address": "123 Street, Model Town, Lahore"
  },
  "pickup": {
    "name": "GrillVibes Restaurant",
    "address": "Main Boulevard, Lahore",
    "lat": 31.5204,
    "lng": 74.3587
  },
  "dropoff": {
    "name": "Ali Khan",
    "address": "123 Street, Model Town, Lahore",
    "lat": null,
    "lng": null,
    "needs_geocoding": true
  },
  "actions": ["accept", "reject"]
}
```

### Order Details Screen

```http
GET /api/rider/orders/{order}
```

Use this for the screen with pickup, dropoff, item list, total amount, `I'll Pick Up the Order`, and `Reject Order`.

Important response fields:

```json
{
  "order_code": "#GRV-1025",
  "pickup": {},
  "dropoff": {},
  "customer": {},
  "items": [
    {
      "name": "Zinger Burger",
      "quantity": 2,
      "sub_total_formatted": "Rs 700"
    }
  ],
  "timeline": [
    {"key": "accepted", "label": "Accepted", "done": true},
    {"key": "picked_up", "label": "Picked Up", "done": false},
    {"key": "on_way", "label": "On Way", "done": false},
    {"key": "delivered", "label": "Delivered", "done": false}
  ],
  "actions": ["picked_up"]
}
```

### Live Map / Tracking Screen

```http
GET /api/rider/orders/{order}/tracking
```

Use this for screens 7 and 11 in your design.

Response:

```json
{
  "status": "success",
  "data": {
    "order": {
      "order_code": "#GRV-1025",
      "delivery_status": "on_way",
      "grand_total_formatted": "Rs 1,850"
    },
    "rider": {
      "name": "Ahmed Raza",
      "phone": "923001234567",
      "lat": 31.525,
      "lng": 74.35,
      "last_location_at": "2026-09-27 18:20:00"
    },
    "pickup": {
      "name": "GrillVibes Restaurant",
      "address": "Main Boulevard, Lahore",
      "lat": 31.5204,
      "lng": 74.3587
    },
    "dropoff": {
      "name": "Ali Khan",
      "address": "123 Street, Model Town, Lahore",
      "lat": null,
      "lng": null,
      "needs_geocoding": true
    },
    "route": {
      "status": "on_way",
      "target": "dropoff",
      "polyline_provider": "google_directions",
      "mode": "DRIVING"
    }
  }
}
```

If `dropoff.lat` and `dropoff.lng` are `null`, geocode the customer address in React Native with Google Maps Geocoding before drawing the route.

### Delivered Complete Screen

```http
POST /api/rider/orders/{order}/delivered
```

For COD:

```json
{
  "cash_collected": 1850,
  "notes": "Delivered to customer"
}
```

For proof image, send `multipart/form-data`:

```txt
cash_collected: 1850
notes: Delivered to customer
proof_image: file
```

After success, show the complete screen using response fields plus the previous order detail:

```json
{
  "status": "success",
  "message": "Order delivered.",
  "data": {
    "id": 1025,
    "status": "completed",
    "delivery_status": "delivered",
    "paid": true,
    "delivered_at": "2026-09-27 18:55:00",
    "cash_collected": 1850
  }
}
```

### Earnings Screen

```http
GET /api/rider/earnings?period=daily
GET /api/rider/earnings?period=weekly
GET /api/rider/earnings?period=monthly
```

Response:

```json
{
  "status": "success",
  "data": {
    "period": "daily",
    "total_earnings": 2450,
    "completed_orders": 12,
    "average_per_delivery": 204.17,
    "chart": [
      {"date": "2026-09-21", "label": "21", "earnings": 350, "orders": 2}
    ],
    "recent": [
      {
        "order_code": "#GRV-1025",
        "earned": 175,
        "earned_formatted": "+Rs 175",
        "delivered_label": "Sep 26, 02:15 PM"
      }
    ]
  }
}
```

The current backend estimates rider earning as 10% of order grand total. If your business uses a fixed delivery commission, update `DELIVERY_COMMISSION_RATE` in `RiderOrderController`.

### Rider Profile And Settings

```http
GET /api/rider/profile
```

```http
POST /api/rider/profile
```

Request:

```json
{
  "name": "Ahmed Raza",
  "phone": "923001234567",
  "address": "Lahore",
  "vehicle_type": "Bike",
  "vehicle_number": "LEA-1234",
  "is_available": true
}
```

```http
GET /api/rider/settings
```

Returns notification, location sharing, language, dark mode, support, and version values for the settings screen.

### Notifications Screen

```http
GET /api/rider/notifications
```

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": "order-1025-assigned",
      "type": "order",
      "title": "New Order",
      "message": "#GRV-1025 - Rs 1,850",
      "order_id": 1025,
      "order_code": "#GRV-1025",
      "delivery_status": "assigned",
      "created_at": "2026-09-27 18:20:00"
    }
  ]
}
```

### Login

```http
POST /api/login
```

Request:

```json
{
  "email": "rider@example.com",
  "password": "password"
}
```

Success:

```json
{
  "token": "1|plain-text-token",
  "message": "Login Success",
  "status": "success"
}
```

Store the token securely on the phone and send it with protected requests:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

### Logged In User

```http
GET /api/logged-user
```

Use this after app launch to restore the rider session.

### Logout

```http
POST /api/logout
```

### All Orders

```http
GET /api/orders
```

Current response includes all orders with `orderItems` and customer details.

For the rider app, filter client-side for:

```txt
type = delivery
```

This is only a temporary workaround. In production, add rider-specific endpoints so riders only see their own assigned orders.

### Order Detail

```http
GET /api/orders/{id}
```

Current response returns one order with `order_items`.

### Customer List

```http
GET /api/customers
```

Useful if the order detail does not include enough customer information.

Customer fields:

- `id`
- `name`
- `contact`
- `address`
- `email`
- `loyalty_points_balance`

---

## Recommended Backend Additions

### Database Fields

Add these columns to `orders`:

```txt
rider_id nullable foreign key users.id
delivery_status string default unassigned
assigned_at nullable timestamp
accepted_at nullable timestamp
picked_up_at nullable timestamp
on_way_at nullable timestamp
delivered_at nullable timestamp
delivery_notes nullable text
delivery_proof_path nullable string
```

Recommended `delivery_status` values:

```txt
unassigned
assigned
accepted
rejected
picked_up
on_way
delivered
failed
cancelled
```

Add optional rider profile fields to `users`:

```txt
role = rider
phone
vehicle_type
vehicle_number
is_available boolean default true
last_lat decimal nullable
last_lng decimal nullable
last_location_at timestamp nullable
```

---

## Rider APIs To Add

All routes below should be protected with Sanctum:

```php
Route::middleware('auth:sanctum')->prefix('rider')->group(function () {
    Route::get('/orders', [RiderOrderController::class, 'index']);
    Route::get('/available-riders', [RiderOrderController::class, 'availableRiders']);
    Route::get('/orders/{order}', [RiderOrderController::class, 'show']);
    Route::post('/orders/{order}/assign', [RiderOrderController::class, 'assign']);
    Route::post('/orders/{order}/accept', [RiderOrderController::class, 'accept']);
    Route::post('/orders/{order}/reject', [RiderOrderController::class, 'reject']);
    Route::post('/orders/{order}/picked-up', [RiderOrderController::class, 'pickedUp']);
    Route::post('/orders/{order}/on-way', [RiderOrderController::class, 'onWay']);
    Route::post('/orders/{order}/delivered', [RiderOrderController::class, 'delivered']);
    Route::post('/location', [RiderLocationController::class, 'update']);
    Route::get('/history', [RiderOrderController::class, 'history']);
});
```

### Available Riders

```http
GET /api/rider/available-riders
```

Returns active users with the `rider` role and `is_available = true`.

### Assign Rider

```http
POST /api/rider/orders/{order}/assign
```

Request:

```json
{
  "rider_id": 7
}
```

Response:

```json
{
  "status": "success",
  "message": "Delivery assigned."
}
```

### Assigned Orders

```http
GET /api/rider/orders
```

Returns only delivery orders assigned to the logged-in rider.

Query filters:

| Query | Example | Notes |
| --- | --- | --- |
| `status` | `assigned` | Optional delivery status filter |
| `date` | `2026-09-26` | Optional business date |

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": 101,
      "type": "delivery",
      "status": "pending",
      "delivery_status": "assigned",
      "paid": false,
      "grand_total": "1850.00",
      "order_datetime": "2026-09-26 19:30:00",
      "customer": {
        "id": 5,
        "name": "Ali Khan",
        "contact": "923001234567",
        "address": "House 12, Street 3, Lahore"
      },
      "items_count": 3,
      "assigned_at": "2026-09-26 19:35:00"
    }
  ]
}
```

### Order Detail

```http
GET /api/rider/orders/{order}
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": 101,
    "type": "delivery",
    "status": "pending",
    "delivery_status": "assigned",
    "paid": false,
    "subtotal": "1700.00",
    "service_charges": "150.00",
    "discount_amount": "0.00",
    "grand_total": "1850.00",
    "customer": {
      "id": 5,
      "name": "Ali Khan",
      "contact": "923001234567",
      "address": "House 12, Street 3, Lahore"
    },
    "order_items": [
      {
        "id": 1,
        "fooditems_id": 10,
        "quantity": 2,
        "sub_total": "1200.00",
        "add_note": "No onions"
      }
    ]
  }
}
```

### Accept Delivery

```http
POST /api/rider/orders/{order}/accept
```

Rules:

- Order must belong to logged-in rider.
- Order `type` must be `delivery`.
- Current `delivery_status` must be `assigned`.

Response:

```json
{
  "status": "success",
  "message": "Delivery accepted.",
  "data": {
    "id": 101,
    "delivery_status": "accepted",
    "accepted_at": "2026-09-26 19:40:00"
  }
}
```

### Reject Delivery

```http
POST /api/rider/orders/{order}/reject
```

Request:

```json
{
  "reason": "Too far"
}
```

Response:

```json
{
  "status": "success",
  "message": "Delivery rejected."
}
```

After rejection, admin/POS should be able to assign the order to another rider.

### Mark Picked Up

```http
POST /api/rider/orders/{order}/picked-up
```

Use when the rider collects food from the restaurant.

Response:

```json
{
  "status": "success",
  "message": "Order marked as picked up.",
  "data": {
    "id": 101,
    "delivery_status": "picked_up",
    "picked_up_at": "2026-09-26 19:50:00"
  }
}
```

### Mark On Way

```http
POST /api/rider/orders/{order}/on-way
```

Use when the rider leaves for the customer location.

Response:

```json
{
  "status": "success",
  "message": "Order marked as on the way.",
  "data": {
    "id": 101,
    "delivery_status": "on_way",
    "on_way_at": "2026-09-26 19:55:00"
  }
}
```

### Mark Delivered

```http
POST /api/rider/orders/{order}/delivered
```

Request without proof:

```json
{
  "notes": "Handed to customer"
}
```

Request with proof image should use `multipart/form-data`:

| Field | Type | Required |
| --- | --- | --- |
| `proof_image` | file | No |
| `notes` | string | No |
| `cash_collected` | number | Required if order is unpaid/COD |

Response:

```json
{
  "status": "success",
  "message": "Order delivered.",
  "data": {
    "id": 101,
    "status": "completed",
    "delivery_status": "delivered",
    "paid": true,
    "delivered_at": "2026-09-26 20:20:00"
  }
}
```

### Update Rider Location

```http
POST /api/rider/location
```

Request:

```json
{
  "lat": 31.5204,
  "lng": 74.3587,
  "accuracy": 20
}
```

Response:

```json
{
  "status": "success",
  "message": "Location updated."
}
```

---

## Map And Live Rider Movement

Use the map screen to show the rider moving from the restaurant/pickup point to the customer/dropoff point.

### What The Backend Has Now

The backend already stores the rider's latest location on the logged-in rider user:

```txt
users.last_lat
users.last_lng
users.last_location_at
```

Update these values from the mobile app with:

```http
POST /api/rider/location
```

Request:

```json
{
  "lat": 31.5204,
  "lng": 74.3587,
  "accuracy": 15
}
```

Send this when:

- rider accepts an order
- rider marks picked up
- rider marks on way
- app receives location change while delivery is active
- every 10 to 30 seconds during an active delivery, depending on battery/performance needs

### Pickup And Dropoff Points

For React Native map route drawing, you need three points:

| Point | Source |
| --- | --- |
| Rider current point | Phone GPS and `/api/rider/location` |
| Pickup point | Restaurant/branch/place location |
| Dropoff point | Customer address or customer coordinates |

Current order responses include the customer address:

```json
{
  "customer": {
    "name": "Ali Khan",
    "contact": "923001234567",
    "address": "House 12, Street 3, Lahore"
  }
}
```

If the backend does not yet return exact pickup/dropoff coordinates, the React Native app has two options:

1. Use Google Maps Geocoding API to convert `customer.address` into latitude/longitude.
2. Add coordinate columns later for more accurate delivery routing.

Recommended future order/customer fields:

```txt
pickup_lat
pickup_lng
dropoff_lat
dropoff_lng
delivery_address
```

Recommended API shape for map-ready order detail:

```json
{
  "id": 101,
  "delivery_status": "on_way",
  "pickup": {
    "name": "GrillVibes Branch",
    "address": "Main Boulevard, Lahore",
    "lat": 31.5204,
    "lng": 74.3587
  },
  "dropoff": {
    "name": "Ali Khan",
    "address": "House 12, Street 3, Lahore",
    "lat": 31.5312,
    "lng": 74.3401
  },
  "rider": {
    "lat": 31.5250,
    "lng": 74.3500,
    "last_location_at": "2026-09-27 18:20:00"
  }
}
```

### React Native Map Screen

Recommended package:

```txt
react-native-maps
react-native-maps-directions
@react-native-community/geolocation
```

Map UI:

```txt
Top: Order number, customer name, delivery status
Map: rider marker, pickup marker, dropoff marker, route polyline
Bottom: address, call/WhatsApp buttons, next delivery action button
```

Marker behavior:

| Marker | Icon |
| --- | --- |
| Rider | bike/rider marker |
| Pickup | restaurant marker |
| Dropoff | home/location pin |

Route behavior:

| Delivery Status | Route To Show |
| --- | --- |
| `accepted` | Rider current location -> pickup point |
| `picked_up` | Pickup point -> dropoff point |
| `on_way` | Rider current location -> dropoff point |
| `delivered` | No active route, show completed state |

### React Native Example

```tsx
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_KEY';

export function DeliveryMap({ riderLocation, pickup, dropoff, deliveryStatus }) {
  const destination =
    deliveryStatus === 'accepted'
      ? pickup
      : dropoff;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: riderLocation.lat,
        longitude: riderLocation.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
    >
      <Marker
        coordinate={{ latitude: riderLocation.lat, longitude: riderLocation.lng }}
        title="Rider"
      />

      <Marker
        coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
        title="Pickup"
      />

      <Marker
        coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
        title="Customer"
      />

      <MapViewDirections
        origin={{ latitude: riderLocation.lat, longitude: riderLocation.lng }}
        destination={{ latitude: destination.lat, longitude: destination.lng }}
        apikey={GOOGLE_MAPS_API_KEY}
        strokeWidth={5}
        strokeColor="#ff6b00"
        mode="DRIVING"
      />
    </MapView>
  );
}
```

### Send Rider Live Location From App

```ts
async function updateRiderLocation(token: string, position: GeolocationPosition) {
  await fetch('https://your-domain.com/api/rider/location', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    }),
  });
}
```

Use `watchPosition` only when delivery is active:

```ts
Geolocation.watchPosition(
  position => updateRiderLocation(token, position),
  error => console.log(error),
  {
    enableHighAccuracy: true,
    distanceFilter: 20,
    interval: 15000,
    fastestInterval: 10000,
  },
);
```

### App Permissions

Android permissions:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

iOS permissions:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>GrillVibes uses your location to update delivery progress.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>GrillVibes uses your location during active deliveries.</string>
```

### Delivery History

```http
GET /api/rider/history
```

Query filters:

| Query | Example |
| --- | --- |
| `from` | `2026-09-01` |
| `to` | `2026-09-26` |

Response:

```json
{
  "status": "success",
  "data": [
    {
      "id": 99,
      "grand_total": "2200.00",
      "delivered_at": "2026-09-25 21:10:00",
      "customer": {
        "name": "Sara Ahmed",
        "address": "Gulberg, Lahore"
      }
    }
  ]
}
```

---

## Rider App Screens

### 1. Login

Use:

```http
POST /api/login
```

After success:

- save token
- fetch profile from `GET /api/logged-user`
- verify user role is rider
- navigate to assigned deliveries

### 2. Assigned Deliveries

Use:

```http
GET /api/rider/orders
```

Show:

- order number
- customer name
- address
- total
- payment status
- delivery status
- assigned time

### 3. Delivery Detail

Use:

```http
GET /api/rider/orders/{order}
```

Show:

- customer name
- phone button
- WhatsApp button
- address
- order items
- notes
- payment status
- total amount
- action button based on current delivery status

### 4. Status Actions

Button flow:

```txt
assigned -> Accept
accepted -> Picked Up
picked_up -> On Way
on_way -> Delivered
```

Allow reject only while status is `assigned`.

### 5. Delivery History

Use:

```http
GET /api/rider/history
```

Show completed deliveries by date.

---

## Mobile App Validation

The app should block invalid actions:

| Current Status | Allowed Action |
| --- | --- |
| `assigned` | accept, reject |
| `accepted` | picked up |
| `picked_up` | on way |
| `on_way` | delivered |
| `delivered` | no action |
| `cancelled` | no action |

---

## Payment Handling

If `paid = true`, rider only delivers.

If `paid = false`, treat as cash on delivery:

1. Show amount to collect.
2. Require `cash_collected` on delivery.
3. Backend should mark `paid = true` only after successful delivery confirmation.

---

## Backend Setup Before Building Rider App

Required after deploying this code:

1. Run migrations.
2. Create rider users or assign the `rider` role to existing users.
3. Use `GET /api/rider/available-riders` and `POST /api/rider/orders/{order}/assign` from the admin/POS side.
4. Build the rider app against the protected rider routes.

Optional but recommended:

1. Push notifications for new assignments.
2. Admin dashboard for rider location.
3. Failed delivery reason reports.
4. Cash collection summary.

---

## Current Temporary Build Option

If you need a quick prototype before backend changes:

1. Use `POST /api/login`.
2. Use `GET /api/orders`.
3. Filter orders where `type === "delivery"`.
4. Open order details with `GET /api/orders/{id}`.
5. Display customer address and contact.

Do not use this temporary option for production because every rider would be able to see every order unless the backend is protected and scoped properly.
