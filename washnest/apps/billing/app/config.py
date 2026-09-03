import os
from dotenv import load_dotenv

load_dotenv()

CORS_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8000").split(",")
    if o.strip()
]
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./billing.db")

# Shop defaults
SHOP_NAME: str = os.getenv("SHOP_NAME", "Wash Nest")
SHOP_PHONE: str = os.getenv("SHOP_PHONE", "")
GST_NUMBER: str = os.getenv("GST_NUMBER", "")
GST_ENABLED: bool = os.getenv("GST_ENABLED", "false").lower() == "true"
GST_RATE: float = float(os.getenv("GST_RATE", "18"))
EXPRESS_MULTIPLIER: float = float(os.getenv("EXPRESS_MULTIPLIER", "1.5"))
MIN_ORDER_VALUE: float = float(os.getenv("MIN_ORDER_VALUE", "0"))
DEFAULT_DELIVERY_CHARGE: float = float(os.getenv("DEFAULT_DELIVERY_CHARGE", "0"))
