from sqlalchemy.orm import Session
from . import models
from .auth import get_password_hash

DEFAULT_PASSWORD = "password123"


def seed_environment_data(db: Session):
    # ---- Seed Users ----
    if db.query(models.User).count() == 0:
        hashed = get_password_hash(DEFAULT_PASSWORD)
        baseline_users = [
            models.User(name="Alice Johnson", email="alice@example.com", hashed_password=hashed),
            models.User(name="Bob Smith", email="bob@example.com", hashed_password=hashed),
            models.User(name="Charlie Brown", email="charlie@example.com", hashed_password=hashed),
            models.User(name="Diana Prince", email="diana@example.com", hashed_password=hashed),
            models.User(name="Ethan Hunt", email="ethan@example.com", hashed_password=hashed),
        ]
        db.add_all(baseline_users)
        db.commit()

    # ---- Seed Products ----
    if db.query(models.Product).count() == 0:
        baseline_products = [
            models.Product(name="Laptop Pro 15", price=1499.99, stock=10),
            models.Product(name="Wireless Headphones", price=199.99, stock=50),
            models.Product(name="Smartphone X", price=999.99, stock=25),
            models.Product(name="4K Monitor 27\"", price=349.99, stock=15),
            models.Product(name="Mechanical Keyboard", price=129.99, stock=40),
            models.Product(name="Gaming Mouse", price=79.99, stock=60),
            models.Product(name="USB-C Docking Station", price=199.99, stock=20),
            models.Product(name="Portable SSD 1TB", price=149.99, stock=30),
            models.Product(name="Bluetooth Speaker", price=89.99, stock=35),
            models.Product(name="Noise Cancelling Earbuds", price=149.99, stock=45),
        ]
        db.add_all(baseline_products)
        db.commit()

    # ---- Seed Orders ----
    if db.query(models.Order).count() == 0:
        baseline_orders = [
            models.Order(user_id=1, product_id=1, quantity=1, status="paid"),
            models.Order(user_id=2, product_id=2, quantity=2, status="pending"),
            models.Order(user_id=3, product_id=3, quantity=1, status="cancelled"),
            models.Order(user_id=4, product_id=4, quantity=1, status="paid"),
            models.Order(user_id=5, product_id=5, quantity=3, status="pending"),
        ]
        db.add_all(baseline_orders)
        db.commit()
