"""Seed the database with default prices and settings for Wash Nest."""
from app.database import SessionLocal
from app.models import PriceList, Setting

DEFAULT_PRICES = [
    # Wash & Fold - Clothing
    ("wash_fold", "Shirt", "clothing", 20, None, False),
    ("wash_fold", "T-Shirt", "clothing", 20, None, False),
    ("wash_fold", "Trousers", "clothing", 25, None, False),
    ("wash_fold", "Jeans", "clothing", 30, None, False),
    ("wash_fold", "Shorts", "clothing", 15, None, False),
    ("wash_fold", "Kurta", "clothing", 25, None, False),
    ("wash_fold", "Kurta Set", "clothing", 40, None, False),
    ("wash_fold", "Saree", "clothing", 50, None, False),
    ("wash_fold", "Salwar Kameez", "clothing", 40, None, False),
    ("wash_fold", "Jacket", "clothing", 50, None, False),
    ("wash_fold", "Sweater", "clothing", 40, None, False),
    ("wash_fold", "Hoodie", "clothing", 40, None, False),
    ("wash_fold", "Innerwear (per pc)", "clothing", 10, None, False),
    ("wash_fold", "Socks (pair)", "clothing", 10, None, False),
    # Wash & Fold - Bedding & Household
    ("wash_fold", "Bedsheet (Single)", "bedding", 40, None, False),
    ("wash_fold", "Bedsheet (Double)", "bedding", 60, None, False),
    ("wash_fold", "Pillow Cover", "bedding", 15, None, False),
    ("wash_fold", "Blanket (Single)", "bedding", 100, None, False),
    ("wash_fold", "Blanket (Double)", "bedding", 150, None, False),
    ("wash_fold", "Comforter", "bedding", 200, None, False),
    ("wash_fold", "Curtain (per piece)", "household", 60, None, False),
    ("wash_fold", "Towel (Small)", "household", 15, None, False),
    ("wash_fold", "Towel (Large/Bath)", "household", 25, None, False),
    ("wash_fold", "Table Cloth", "household", 30, None, False),
    ("wash_fold", "Sofa Cover", "household", 80, None, False),
    # Wash & Fold - Per KG
    ("wash_fold", "Mixed Clothes (per kg)", "clothing", 0, 49, True),
    # Ironing / Steam Press
    ("iron", "Shirt", "clothing", 10, None, False),
    ("iron", "T-Shirt", "clothing", 10, None, False),
    ("iron", "Trousers", "clothing", 15, None, False),
    ("iron", "Jeans", "clothing", 15, None, False),
    ("iron", "Kurta", "clothing", 15, None, False),
    ("iron", "Saree", "clothing", 30, None, False),
    ("iron", "Salwar Kameez", "clothing", 25, None, False),
    ("iron", "Suit (2-piece)", "clothing", 50, None, False),
    ("iron", "Suit (3-piece)", "clothing", 70, None, False),
    ("iron", "Bedsheet (Single)", "bedding", 15, None, False),
    ("iron", "Bedsheet (Double)", "bedding", 25, None, False),
    # Wash & Iron
    ("wash_iron", "Shirt", "clothing", 30, None, False),
    ("wash_iron", "T-Shirt", "clothing", 30, None, False),
    ("wash_iron", "Trousers", "clothing", 35, None, False),
    ("wash_iron", "Jeans", "clothing", 40, None, False),
    ("wash_iron", "Kurta", "clothing", 35, None, False),
    ("wash_iron", "Saree", "clothing", 70, None, False),
    ("wash_iron", "Salwar Kameez", "clothing", 60, None, False),
    ("wash_iron", "Suit (2-piece)", "clothing", 120, None, False),
    ("wash_iron", "Bedsheet (Single)", "bedding", 50, None, False),
    ("wash_iron", "Bedsheet (Double)", "bedding", 80, None, False),
    # Dry Clean
    ("dry_clean", "Suit (2-piece)", "clothing", 250, None, False),
    ("dry_clean", "Suit (3-piece)", "clothing", 350, None, False),
    ("dry_clean", "Blazer", "clothing", 200, None, False),
    ("dry_clean", "Jacket/Coat", "clothing", 250, None, False),
    ("dry_clean", "Saree (Silk)", "clothing", 200, None, False),
    ("dry_clean", "Lehenga", "clothing", 400, None, False),
    ("dry_clean", "Sherwani", "clothing", 350, None, False),
    ("dry_clean", "Wedding Dress", "clothing", 500, None, False),
    ("dry_clean", "Blanket", "bedding", 300, None, False),
    ("dry_clean", "Curtain (per piece)", "household", 150, None, False),
]

DEFAULT_SETTINGS = {
    "shop_name": "Wash Nest",
    "shop_phone": "",
    "shop_address": "",
    "gst_number": "",
    "gst_enabled": "false",
    "gst_rate": "18",
    "express_multiplier": "1.5",
    "min_order_value": "0",
    "default_delivery_charge": "0",
    "next_order_number": "1",
    "financial_year": "2526",  # FY 2025-26
}


def seed():
    db = SessionLocal()
    try:
        # Seed prices
        if db.query(PriceList).count() == 0:
            for stype, name, cat, price, pkg, is_kg in DEFAULT_PRICES:
                db.add(PriceList(
                    service_type=stype,
                    item_name=name,
                    category=cat,
                    price=price,
                    price_per_kg=pkg,
                    is_per_kg=is_kg,
                ))
            db.commit()
            print(f"Seeded {len(DEFAULT_PRICES)} price items.")
        else:
            print("Price list already has data — skipping seed.")

        # Seed settings
        if db.query(Setting).count() == 0:
            for key, value in DEFAULT_SETTINGS.items():
                db.add(Setting(key=key, value=value))
            db.commit()
            print(f"Seeded {len(DEFAULT_SETTINGS)} settings.")
        else:
            print("Settings already exist — skipping seed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
