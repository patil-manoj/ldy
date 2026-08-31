# 🧺 Wash Nest

Complete technology stack for **Wash Nest**, a local laundry shop in Banashankari, South Bengaluru.

## Architecture

```
Customer
   │
   ├─── Google Search / Maps → [Next.js Website on Vercel]
   │                                  │ Click-to-WhatsApp CTA
   │                                  ▼
   └─────────────────────────── [WhatsApp]
                                Meta Cloud API
                                Webhook on Render.com (free)
                                        │
                                        │ POST /api/orders via Cloudflare Tunnel
                                        ▼
                              [Shop PC — Local System]
                              FastAPI + SQLite
                              Accessible at localhost:8000
                              Exposed via Cloudflare Tunnel
                                        │
                                        ▼
                              Google Drive (nightly backup)
```

## Monorepo Structure

```
washnest/
├── apps/
│   ├── billing/          # FastAPI + SQLite — local billing system
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

### 1. Billing System (Shop PC)

```bash
cd apps/billing
pip install -r requirements.txt
cp ../../.env.example .env   # Edit values
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000 — the billing dashboard is served from here.

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
| Google Drive backup | Free (15GB) |
| **Total** | **~₹800/year** |

## Tech Stack

| Layer | Tool |
|-------|------|
| Billing backend | FastAPI + SQLite |
| Billing UI | React (Vite) |
| Website | Next.js 14 + Tailwind CSS |
| WhatsApp bot | Node.js + Express |
| Tunnel | Cloudflare Tunnel |
| Backups | rclone → Google Drive |
