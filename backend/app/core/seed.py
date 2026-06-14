"""
KORA Brand — Synthetic Seed Data Generator
Generates 500 realistic Indian fashion brand customers with 2500 orders.
"""
import random
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from faker import Faker

fake = Faker("en_IN")
random.seed(42)   # Reproducible data

# ── Brand Config ─────────────────────────────────────────────────────────────
BRAND = "KORA"

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai",
    "Hyderabad", "Pune", "Kolkata", "Ahmedabad"
]

CATEGORIES = [
    "Ethnic Wear", "Western Wear", "Footwear",
    "Accessories", "Activewear", "Kidswear"
]

CATEGORY_WEIGHTS = [0.30, 0.25, 0.15, 0.15, 0.10, 0.05]

PRODUCTS = {
    "Ethnic Wear": [
        "Floral Anarkali Kurta", "Banarasi Silk Saree", "Embroidered Lehenga Set",
        "Cotton Kurta Palazzo Set", "Chanderi Suit", "Printed Sharara Set",
        "Silk Sherwani", "Bandhani Dupatta Kurta"
    ],
    "Western Wear": [
        "Linen Blazer", "Flared Midi Dress", "High-Rise Straight Jeans",
        "Wrap Maxi Dress", "Oversized Shirt", "Pleated Wide-Leg Trousers",
        "Slip Dress", "Cropped Trench Coat"
    ],
    "Footwear": [
        "Block Heel Sandals", "Kolhapuri Flats", "Strappy Heels",
        "White Sneakers", "Mojari Juttis", "Wedge Espadrilles",
        "Loafers", "Platform Boots"
    ],
    "Accessories": [
        "Oxidised Silver Earrings", "Beaded Tote Bag", "Silk Scarf",
        "Leather Crossbody Bag", "Statement Necklace", "Sunglasses",
        "Pearl Drop Earrings", "Embroidered Clutch"
    ],
    "Activewear": [
        "High-Waist Yoga Leggings", "Sports Bra Set", "Track Pants",
        "Workout Shorts", "Zip-Up Hoodie", "Tank Top Set",
        "Running Shorts", "Cycling Tights"
    ],
    "Kidswear": [
        "Ethnic Kurta Set (Boys)", "Frock with Leggings", "Dungaree Set",
        "Kurta Pyjama Set", "Party Dress", "Casual T-Shirt Set"
    ]
}

PRICE_RANGES = {
    "Ethnic Wear":  (1200, 8500),
    "Western Wear": (800, 4500),
    "Footwear":     (600, 3500),
    "Accessories":  (400, 2500),
    "Activewear":   (500, 2800),
    "Kidswear":     (400, 1800),
}

CHANNELS = ["online", "app", "offline"]
CHANNEL_WEIGHTS = [0.55, 0.30, 0.15]

COMM_CHANNELS = ["whatsapp", "sms", "email", "rcs"]
COMM_WEIGHTS = [0.50, 0.20, 0.20, 0.10]

# Indian first names
MALE_NAMES = [
    "Aarav", "Arjun", "Vivaan", "Aditya", "Vihaan", "Sai", "Ayaan",
    "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Reyansh", "Dhruv",
    "Kabir", "Ritvik", "Anirudh", "Pranav", "Rohan", "Vikram",
    "Rahul", "Nikhil", "Karan", "Amit", "Suresh", "Mohan", "Rajesh",
    "Deepak", "Sandeep", "Naveen"
]

FEMALE_NAMES = [
    "Aadhya", "Aanya", "Ananya", "Pari", "Anika", "Navya", "Angel",
    "Diya", "Saanvi", "Myra", "Sara", "Ira", "Priya", "Divya", "Kavya",
    "Shreya", "Sneha", "Pooja", "Riya", "Nisha", "Meera", "Lakshmi",
    "Deepa", "Sunita", "Rekha", "Shalini", "Anjali", "Neha", "Swati", "Tanvi"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Mehta", "Gupta", "Joshi",
    "Patel", "Shah", "Reddy", "Nair", "Iyer", "Rao", "Krishnan",
    "Agarwal", "Banerjee", "Chatterjee", "Das", "Bose", "Pillai",
    "Naidu", "Menon", "Kaur", "Malhotra", "Kapoor", "Khanna", "Sethi"
]


def _random_name_email_phone(gender: str) -> tuple:
    if gender == "male":
        first = random.choice(MALE_NAMES)
    else:
        first = random.choice(FEMALE_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    slug = f"{first.lower()}.{last.lower()}{random.randint(10, 999)}"
    email = f"{slug}@{random.choice(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])}"
    phone = f"+91{random.randint(7000000000, 9999999999)}"
    return name, email, phone


def _tier_from_stats(total_spend: float, days_since: int) -> str:
    if total_spend >= 25000 and days_since <= 30:
        return "platinum"
    elif total_spend >= 8000 and days_since <= 60:
        return "gold"
    elif total_spend >= 2500 and days_since <= 90:
        return "silver"
    return "bronze"


def generate_customers_and_orders():
    """
    Returns two lists: customers_data (dicts), orders_data (dicts).
    Suitable for bulk insertion via SQLAlchemy.
    """
    now = datetime.now(timezone.utc)
    customers_data = []
    orders_data = []
    order_items_data = []
    used_emails = set()
    used_phones = set()

    # Build order time distribution — seasonal peaks for Indian market
    def random_order_date() -> datetime:
        """Biased toward Oct-Nov (Diwali), Feb (Valentine's), Apr (Eid/summer)."""
        day_offset = random.randint(0, 548)  # 18 months
        base = now - timedelta(days=day_offset)
        # Boost probability for festival months
        month = base.month
        if month in (10, 11):   # Diwali
            if random.random() < 0.6:
                return base
        elif month in (2, 3):   # Valentine's + Holi
            if random.random() < 0.4:
                return base
        return base

    for i in range(500):
        gender = random.choice(["male", "female", "female"])  # Slight female bias

        # Avoid duplicate emails/phones
        attempts = 0
        while True:
            name, email, phone = _random_name_email_phone(gender)
            if email not in used_emails and phone not in used_phones:
                used_emails.add(email)
                used_phones.add(phone)
                break
            attempts += 1
            if attempts > 20:
                email = f"user{i}_{random.randint(1000,9999)}@example.com"
                phone = f"+91{random.randint(7000000000, 9999999999)}"
                break

        city = random.choice(CITIES)
        age = random.randint(18, 55)
        preferred_channel = random.choices(COMM_CHANNELS, weights=COMM_WEIGHTS)[0]
        preferred_cat = random.choices(CATEGORIES, weights=CATEGORY_WEIGHTS)[0]

        # Determine order count — power-law distribution
        n_orders = max(1, int(random.paretovariate(1.5)))
        n_orders = min(n_orders, 20)

        customer_orders = []
        total_spend = 0.0
        order_dates = []

        for j in range(n_orders):
            order_id = uuid.uuid4()
            order_date = random_order_date()
            category = random.choices(CATEGORIES, weights=CATEGORY_WEIGHTS)[0]
            if j == 0:
                category = preferred_cat   # First order always in preferred category

            items_count = random.randint(1, 3)
            items = []
            order_total = 0.0

            for _ in range(items_count):
                product = random.choice(PRODUCTS[category])
                price_min, price_max = PRICE_RANGES[category]
                unit_price = round(random.uniform(price_min, price_max), 2)
                qty = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
                items.append({
                    "id": uuid.uuid4(),
                    "product": product,
                    "category": category,
                    "quantity": qty,
                    "unit_price": unit_price,
                })
                order_total += unit_price * qty

            order_total = round(order_total, 2)
            total_spend += order_total
            order_dates.append(order_date)

            order_number = f"KORA-{order_date.year}{order_date.month:02d}-{str(order_id)[:6].upper()}"
            order_rec = {
                "id": order_id,
                "customer_id": None,  # filled below
                "order_number": order_number,
                "status": random.choices(
                    ["completed", "returned", "cancelled"],
                    weights=[0.85, 0.10, 0.05]
                )[0],
                "total_amount": order_total,
                "channel": random.choices(CHANNELS, weights=CHANNEL_WEIGHTS)[0],
                "attributed_to": None,
                "created_at": order_date,
            }
            customer_orders.append((order_rec, items))

        # Sort orders by date, find last order
        customer_orders.sort(key=lambda x: x[0]["created_at"], reverse=True)
        last_order_date = customer_orders[0][0]["created_at"]
        days_since = (now - last_order_date).days

        # Assign tier
        tier = _tier_from_stats(total_spend, days_since)

        # Compute avg order value
        avg_ov = round(total_spend / n_orders, 2) if n_orders else 0

        customer_id = uuid.uuid4()

        customers_data.append({
            "id": customer_id,
            "name": name,
            "email": email,
            "phone": phone,
            "city": city,
            "gender": gender,
            "age": age,
            "tier": tier,
            "preferred_cat": preferred_cat,
            "total_orders": n_orders,
            "total_spend": round(total_spend, 2),
            "avg_order_value": avg_ov,
            "last_order_date": last_order_date,
            "days_since_last_order": days_since,
            "preferred_channel": preferred_channel,
            "opted_out": random.random() < 0.03,  # 3% opted out
            "created_at": last_order_date - timedelta(days=random.randint(30, 400)),
        })

        for order_rec, items in customer_orders:
            order_rec["customer_id"] = customer_id
            orders_data.append(order_rec)
            for item in items:
                item["order_id"] = order_rec["id"]
                order_items_data.append(item)

    return customers_data, orders_data, order_items_data


def run_seed(db):
    """
    Seed the database with KORA brand data.
    Idempotent — clears existing data first.
    """
    from app.models.customer import Customer
    from app.models.order import Order, OrderItem
    from sqlalchemy import text

    # Clear in dependency order
    db.execute(text("DELETE FROM comm_events"))
    db.execute(text("DELETE FROM messages"))
    db.execute(text("DELETE FROM campaigns"))
    db.execute(text("DELETE FROM segments"))
    db.execute(text("DELETE FROM order_items"))
    db.execute(text("DELETE FROM orders"))
    db.execute(text("DELETE FROM customers"))
    db.commit()

    customers_data, orders_data, order_items_data = generate_customers_and_orders()

    # Bulk insert customers
    db.bulk_insert_mappings(Customer, customers_data)
    db.commit()

    # Bulk insert orders
    db.bulk_insert_mappings(Order, orders_data)
    db.commit()

    # Bulk insert order items
    db.bulk_insert_mappings(OrderItem, order_items_data)
    db.commit()

    return {
        "customers": len(customers_data),
        "orders": len(orders_data),
        "order_items": len(order_items_data),
    }
