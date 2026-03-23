from fastapi import FastAPI
from .database import Base, engine, SessionLocal
from . import models
from .routers import users, products, orders
from .seed import seed_environment_data

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Telecom Backend")

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

