from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from . import models
from .routers import users, products, orders
from .seed import seed_environment_data

models.Base.metadata.create_all(bind=engine)

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
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"message": "Backend is running"}
