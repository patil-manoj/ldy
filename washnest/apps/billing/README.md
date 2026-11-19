# Wash Nest Billing

Static React billing and order management. The app is deployed to Netlify and
connects directly from the browser to Supabase; no custom server, VPS, API, or
Netlify Function is required.

## Storage and authentication

- Business records are stored in normalized Supabase PostgreSQL tables.
- Supabase Auth email/password protects the billing workspace, and Row Level Security allows only authenticated users.
- The browser uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the admin account email.
- The JSON backup and restore flow remains available from **Admin settings**.
- Database operations require an online connection; IndexedDB is no longer the source of truth.

## Features

- Create and search customers and bills.
- Calculate weight rounding, discounts, delivery, express charges, and GST.
- Record payments and order status history.
- Manage prices, expenses, settings, dashboards, and daily reports.
- Supports three services: washing, ironing, and dry cleaning.
- Print receipts, open prepared bills in WhatsApp, and install the PWA.
- Export and restore all business data with a JSON backup.

## Cloud limits

- Supabase free projects may pause after inactivity and have usage limits.
- Offline-first operation is not provided by the remote adapter; keep exporting backups.
- Automatic WhatsApp/SMS sending and tamper-proof audit logs are outside this app.

## Development

```bash
cd apps/billing/ui
npm install
npm run dev
```

Set the Supabase variables below in `apps/billing/ui/.env`.

## Configure Supabase

1. Create a free Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](../../../supabase/schema.sql).
3. Set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_ADMIN_EMAIL=admin@example.com
```

The publishable/anon key is intended for browser use. Never use the secret
service-role key in the frontend. Create the matching admin user in
Supabase **Authentication > Users** before signing in.

## Production build

```bash
cd apps/billing/ui
npm install
npm run build
```

The deployable static app is written to `apps/billing/static/`.

## Deploy to Netlify

This remains a static deployment; no Functions or custom backend is required.
Set the two `VITE_` variables in Netlify site environment variables, then:

1. Set **Base directory** to `washnest/apps/billing/ui`.
2. Let `netlify.toml` provide the build and publish settings.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
   `VITE_SUPABASE_ADMIN_EMAIL` as Netlify environment variables.

The same Supabase account can access the same records from the deployed URL,
another browser, or another device.

## Phone workflow

1. Open the hosted HTTPS URL on the phone.
2. Add Wash Nest to the home screen.
3. Configure shop details and prices, then create and send bills.
4. Download a JSON backup regularly from **Admin settings > Cloud data**.

## Backups

The JSON backup contains customers, bills, payments, order history, prices,
expenses, and business settings. It does not contain the Supabase password.
