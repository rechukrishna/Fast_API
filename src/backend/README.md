# Backend API

FastAPI backend with PostgreSQL and pgAdmin.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Python 3.10+ (for running tests locally)

## Run Step by Step

### Step 1: Start the database and API

```bash
cd Fast_API/src/backend
docker-compose up -d
```

This starts PostgreSQL, the FastAPI app, and pgAdmin.

### Step 2: Wait for the API to be ready

The API starts after the database is healthy. Give it ~15–30 seconds, then verify:

```bash
# PowerShell - check if API responds
Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing

# Or open in browser: http://localhost:8000/docs
```

You should see `{"message":"Backend is running"}` or the Swagger docs page.

### Step 3: Run the API tests

**Option A: Run tests in a Docker container** (recommended)

```bash
docker-compose --profile test run --rm robot-tests
```

Results are written to `tests/results/`. Open `tests/results/report.html` in a browser.

**Option B: Run tests locally** (requires Python)

```bash
pip install -r requirements-test.txt
robot --outputdir tests/results tests/api/
```

---

## Quick Start (all at once)

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
- `GET/POST/DELETE /users` - Users
- `GET/POST/DELETE /products` - Products
- `GET/POST/DELETE /orders` - Orders

## API Tests

Robot Framework API tests are in `tests/api/`. Run them when the API is up:

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all API tests (ensure API is running: docker-compose up -d)
robot tests/api/

# Run specific test file
robot tests/api/users.robot

# Run with custom API URL (e.g. when API runs elsewhere)
robot --variable API_URL:http://host.docker.internal:8000 tests/api/
```

Test output is written to `tests/results/report.html` and `tests/results/log.html`.

## Stop

```bash
docker-compose down -v
```

## Jenkins CI

A Jenkins Pipeline is configured at the project root. See [JENKINS.md](../../JENKINS.md) for setup instructions.
