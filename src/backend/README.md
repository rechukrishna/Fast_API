# Backend API

FastAPI backend with PostgreSQL and pgAdmin.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Quick Start

```bash
# Clone the repo (if you haven't already)
git clone https://github.com/rechukrishna/Fast_API.git
cd Fast_API/src/backend

# Build and run
docker-compose up -d
```

## Services

| Service   | URL                    | Description        |
|-----------|------------------------|--------------------|
| API       | http://localhost:8000  | FastAPI backend    |
| API docs  | http://localhost:8000/docs | Swagger UI   |
| pgAdmin   | http://localhost:5051  | Database admin (wait ~2 min after startup) |

## pgAdmin Login

- **Email:** admin@admin.com
- **Password:** admin

To connect to the database in pgAdmin:
- **Host:** `db`
- **Port:** 5432
- **Database:** testdb
- **Username:** test
- **Password:** test

## API Endpoints

- `GET /` - Health check
- `GET/POST /users` - Users
- `GET/POST /products` - Products
- `GET/POST /orders` - Orders

## Stop

```bash
docker-compose down
```
