# Wash Nest — Billing System

Local billing and order management system for the shop PC.

## Stack

- **Backend:** FastAPI + SQLite (via SQLAlchemy)
- **Frontend:** React (Vite), served by FastAPI as static files
- **Logging:** Loguru → `logs/billing.log`

## Setup

### 1. Install Python Dependencies

```bash
cd apps/billing
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` in `apps/billing/`:

```env
SECRET_KEY=your-random-secret-key
TUNNEL_SECRET=shared-secret-for-whatsapp-bot
CORS_ORIGINS=http://localhost:5173
```

### 3. Build the Frontend

```bash
cd ui
npm install
npm run build    # Outputs to ../static/
```

### 4. Run the Server

```bash
cd apps/billing
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000 in your browser.

On first run, the database is created automatically and seeded with default prices.

## Development

For frontend development with hot reload:

```bash
# Terminal 1 — API
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — UI (proxies /api to port 8000)
cd ui
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers` | Create customer |
| GET | `/api/customers?phone=` | Lookup by phone |
| GET | `/api/customers/{id}/orders` | Customer order history |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List with filters |
| GET | `/api/orders/{id}` | Order detail |
| PATCH | `/api/orders/{id}/status` | Update status |
| PATCH | `/api/orders/{id}/payment` | Mark as paid |
| GET | `/api/price-list` | Get active prices |
| POST | `/api/price-list` | Create price |
| PUT | `/api/price-list/{id}` | Update price |
| GET | `/api/dashboard` | Today's summary |
| GET | `/api/reports/daily?report_date=` | Daily report |

## Install as Windows Service

Requires [NSSM](https://nssm.cc/download) in your PATH.

```bash
# Run as Administrator
install_service.bat
```

This installs `WashNestBilling` as a Windows service that:
- Auto-starts on boot
- Runs on port 8000
- Logs to `logs/`

To manage:
```bash
nssm status WashNestBilling
nssm stop WashNestBilling
nssm start WashNestBilling
nssm remove WashNestBilling confirm
```

## Security

- The tunnel secret middleware blocks external API requests without a valid `X-Tunnel-Secret` header
- Local requests (127.0.0.1) are always allowed — so the billing UI works without the header
- The billing UI is NOT exposed through the Cloudflare tunnel (only `/api/*` routes are)
