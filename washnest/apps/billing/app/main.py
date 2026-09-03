import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from loguru import logger

from app.config import CORS_ORIGINS
from app.database import engine, Base
from app.routes import customers, orders, prices, dashboard, payments, expenses, settings
from app.seed import seed

# ── Logging ──────────────────────────────────────────────────
logger.remove()
logger.add(sys.stderr, level="INFO", format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
logger.add(LOG_DIR / "billing.log", rotation="5 MB", retention="30 days", level="DEBUG")

# ── App ──────────────────────────────────────────────────────
app = FastAPI(title="Wash Nest Billing", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(prices.router)
app.include_router(dashboard.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(settings.router)

# ── Static UI ────────────────────────────────────────────────
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            return None  # will 404 naturally
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")


# ── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed()
    logger.info("Wash Nest Billing v2 started ✓")
