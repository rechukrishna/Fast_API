from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from . import models
from .routers import auth, users, products, orders
from .seed import seed_environment_data

models.Base.metadata.create_all(bind=engine)

# Migration: add hashed_password column if missing (for existing DBs)
from sqlalchemy import text
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255)"))
except Exception:
    pass  # Column may already exist or DB may not support IF NOT EXISTS

app = FastAPI(title="Telecom Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Accept-Language", "Origin"],
)

# ---- Run environment seeding ----
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    seed_environment_data(db)
    db.close()

# ---- Routers ----
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "Backend is running"}
