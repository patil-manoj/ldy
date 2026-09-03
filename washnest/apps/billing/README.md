# Wash Nest Billing

Frontend-only billing and order management. The React app stores data in IndexedDB in the current browser, works offline after its first load, and does not call or require a backend.

## Supported without a backend

- Create and search customers.
- Create bills with seeded or custom prices.
- Calculate weight rounding, discounts, delivery, express charges, and GST.
- Record full or partial payments and order status history.
- Permanently delete bills from the protected **Manage bills** page.
- View orders, customer history, dashboard totals, expenses, and daily reports.
- Print receipts and open a prepared bill in WhatsApp.
- Install the app on a phone or computer as a PWA.
- Export and restore all business data with a JSON backup.

## Frontend-only limits

- Data belongs to one browser on one device. There is no automatic phone-to-computer or multi-device sync.
- Clearing site data, uninstalling the browser, or losing the device can erase records unless a backup was downloaded.
- The local admin password prevents casual access only. Browser code and data can be inspected or changed by someone with device access.
- A frontend `.env` password would be included in the public JavaScript bundle, so it cannot provide secure authentication.
- Automatic WhatsApp/SMS sending, automatic cloud backup, secure user accounts, tamper-proof audit logs, and concurrent terminals require a backend or managed cloud service.

## Development

Only Node.js is required:

```bash
cd apps/billing/ui
npm install
npm run dev
```

Open http://127.0.0.1:5173. Default prices and settings are added automatically on the first visit.

The default local admin password is `Washnest*123`. Change it from **Admin settings** after signing in.

## Production build

```bash
cd apps/billing/ui
npm install
npm run build
```

The deployable static app is written to `apps/billing/static/`. Upload that directory to an HTTPS static host such as Netlify or Cloudflare Pages. The included `_redirects` file supplies the SPA fallback on Netlify.

PWA installation and local password hashing require HTTPS on a hosted site. Localhost is allowed during development.

## Deploy to Netlify

Yes, this is a frontend-only static app and works on Netlify without Functions or another backend.

When importing this monorepo in Netlify:

1. Set **Package directory** to `apps/billing/ui`.
2. Leave **Base directory** empty so it remains the repository root.
3. Netlify will read `apps/billing/ui/netlify.toml`, run the billing build, and publish `apps/billing/static`.

Use the stable production URL, such as `your-site.netlify.app`, for real billing. Normal redeploys to that same URL keep the browser's IndexedDB records. Deploy Preview URLs, a custom domain, another browser, or another device each have separate storage. Export a backup before changing URL or device, then restore it at the new location.

## Phone workflow

1. Open the hosted HTTPS URL on the phone that will hold the billing records.
2. Use the browser menu to add Wash Nest to the home screen.
3. Open an Administration page and unlock it with `Washnest*123`.
4. Change the password in **Admin settings**.
5. Enter shop details and prices, then create and send bills from the app.
6. Download a JSON backup regularly from **Admin settings > Local data**.

Each hostname has separate browser storage. Export a backup before changing the deployed URL, browser, phone, or later moving to a computer, then restore it on the new device.

## Backups

The JSON backup contains customers, bills, payments, order history, prices, expenses, and business settings. It does not contain the local admin password. Restoring a backup replaces all business data in the current browser.
