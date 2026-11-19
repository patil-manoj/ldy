# 🧺 Wash Nest

Technology stack for **Wash Nest**, a local laundry shop in Banashankari, South Bengaluru.

## Architecture

```
Customer → Next.js website → WhatsApp

Owner phone/computer → React billing PWA on a static host
                               │
                               ├── Supabase records via browser SDK
                               ├── Print / WhatsApp bill sharing
                               └── Manual JSON backup and restore
```

## Monorepo Structure

```
washnest/
├── apps/
│   ├── billing/          # React PWA + Supabase — static billing frontend
│   └── website/          # Next.js 14 — public website (Vercel)
├── services/
│   └── whatsapp-bot/     # Node.js webhook — WhatsApp bot (Render.com)
├── scripts/
│   ├── backup.py         # Nightly Google Drive backup
│   ├── tunnel.sh         # Cloudflare tunnel (Linux/Mac)
│   ├── tunnel.bat         # Cloudflare tunnel (Windows)
│   └── install_tunnel_service.bat
├── .env.example
└── README.md
```

## Quick Start

### 1. Billing System

```bash
cd apps/billing/ui
npm install
npm run dev
```

Open http://127.0.0.1:5173. No Python process or custom database server is required.
Configure the Supabase variables and create the admin user described in
[apps/billing/README.md](apps/billing/README.md) before signing in.

### 2. Build the Billing UI

```bash
cd apps/billing/ui
npm install
npm run build          # Outputs to apps/billing/static/
```

### 3. Cloudflare Tunnel

See [scripts/README_TUNNEL.md](scripts/README_TUNNEL.md) for full setup.

### 4. WhatsApp Bot

```bash
cd services/whatsapp-bot
npm install
cp .env.example .env   # Fill in Meta Cloud API credentials
npm start
```

Deploy to Render.com — see [services/whatsapp-bot/README.md](services/whatsapp-bot/README.md).

### 5. Website

```bash
cd apps/website
npm install
cp .env.example .env.local
npm run dev            # Development
npm run build          # Static export for Vercel
```

#### SEO and domain setup

The live site is currently served at `https://washnest.netlify.app`. Keep
`NEXT_PUBLIC_SITE_URL` set to that URL until `washnest.in` is connected to the
same deployment and no longer shows a parked-domain page. The canonical URLs,
robots file, and sitemap all use this value. After connecting the custom domain,
set `NEXT_PUBLIC_SITE_URL=https://washnest.in`, redeploy, and submit the sitemap
at `https://washnest.in/sitemap.xml` in Google Search Console.

### 6. Nightly Backups

```bash
# Install rclone and configure 'gdrive' remote
rclone config
python scripts/backup.py
```

Schedule via Windows Task Scheduler for nightly runs.

## Cost

| Service | Cost |
|---------|------|
| Domain (washnest.in) | ~₹800/year |
| Vercel (website) | Free |
| Render.com (WhatsApp bot) | Free |
| Cloudflare Tunnel | Free |
| Meta WhatsApp API | Free (1000 conv/mo) |
| Supabase | Free tier |
| Google Drive backup | Free (15GB) |
| **Total** | **~₹800/year** |

## Tech Stack

| Layer | Tool |
|-------|------|
| Billing app | React PWA (Vite) |
| Billing storage | Supabase PostgreSQL + JSON export/import |
| Website | Next.js 14 + Tailwind CSS |
| WhatsApp bot | Node.js + Express |
| Tunnel | Cloudflare Tunnel |
| Backups | rclone → Google Drive |
