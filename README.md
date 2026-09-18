# GrillVibes

GrillVibes is a restaurant operations platform for running the complete service cycle from one workspace: menu and order management, point of sale, kitchen production, inventory, purchasing, people operations, finance, guest ordering, and reporting.

## What the app covers

- **Front of house** — POS, orders, customers, branches, dining tables, reservations, and QR menus.
- **Kitchen operations** — kitchen display stations, live ticket boards, preparation workflows, food items, categories, recipes, and food-cost reporting.
- **Inventory and procurement** — ingredients, stock, recipes, vendors, purchase orders, and goods receipts.
- **People and finance** — employees, attendance, leave, overtime, loans, payroll, expenses, vouchers, petty cash, and role-based permissions.
- **Customer growth** — loyalty, promo codes, discount campaigns, feedback, blogs, and customer records.
- **Operations control** — multi-branch administration, assets, maintenance logs, settings, WhatsApp device pairing, and activity visibility.

The public home page introduces the product at `/`. Authenticated team members use `/dashboard`; public guest ordering is available through `/menu/{slug}`.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Laravel 12, PHP 8.2+ |
| Authentication | Laravel session auth for the web app, Sanctum for API clients |
| Frontend | Vue 3, Inertia.js, Vue Router |
| Build | Vite 6+, Laravel Vite plugin |
| Styling | Tailwind CSS v4 and Bootstrap 5 |
| Supporting packages | Intervention Image, Spatie Image/Browsershot, Milon Barcode, Laravel Phone |

## Application structure

- `app/Http/Controllers/` contains web and API controllers grouped by domain.
- `app/Models/` contains the restaurant, inventory, people, finance, CRM, and operations models.
- `resources/js/pages/` contains Inertia screens and guest-facing Vue pages.
- `resources/js/components/` contains the admin shell, navigation, tables, forms, modals, and shared UI.
- `resources/js/layouts/` contains the admin, login, and full-screen layouts.
- `routes/web.php` defines the authenticated operations workspace and public guest pages.
- `routes/api.php` exposes API integrations for authentication, menus, orders, reporting, settings, and WhatsApp.

## Main web routes

| Route | Purpose |
| --- | --- |
| `/` | Public GrillVibes home page |
| `/login` | Team member sign-in |
| `/dashboard` | Operations overview |
| `/pos` | Point of sale |
| `/orders` | Order management |
| `/menu/{slug}` | Public QR menu |
| `/board` | Kitchen display board |
| `/inventory/*` | Stock, ingredients, and recipes |
| `/procurement/*` | Vendors, purchase orders, and goods receipts |
| `/reports/*` | Food cost and operational reporting |

The complete route list lives in `routes/web.php` and `routes/api.php`. Access to authenticated screens is controlled by session authentication and feature permissions.

## Getting started

### Requirements

- PHP 8.2 or newer
- Composer
- Node.js 18 or newer and npm
- A configured database supported by Laravel

### Install

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
```

### Run locally

Run the Laravel server and Vite in separate terminals:

```bash
php artisan serve
npm run dev
```

Or use the project development command when the local environment supports it:

```bash
composer dev
```

### Build for production

```bash
npm run build
```

## API

API endpoints are rooted at `/api`. They cover authentication, restaurant data, orders, inventory, customers, reporting, settings, and WhatsApp integrations. Review the middleware groups in `routes/api.php` before exposing an environment publicly.

## License

Open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
