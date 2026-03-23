# Fast API - Test Automation Project

FastAPI backend with PostgreSQL, React UI, Robot Framework API tests, and Jenkins CI.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports 3000, 5432, 8000, and 5051 available
- Python 3.10+ (optional; only for running tests locally without Docker)

## Quick Start (Clone & Run)

```bash
git clone https://github.com/rechukrishna/Fast_API.git
cd Fast_API/src/backend
docker-compose up -d
# Wait ~30 seconds for the API to start, then:
docker-compose --profile test run --rm robot-tests
```

**View results:** Open `tests/results/report.html` in a browser (from `src/backend` directory).

**Stop services:**
```bash
docker-compose down -v
```

## Services

| Service   | URL                         | Description        |
|-----------|-----------------------------|--------------------|
| **UI**    | http://localhost:3000       | React frontend     |
| API       | http://localhost:8000       | FastAPI backend    |
| API docs  | http://localhost:8000/docs  | Swagger UI         |
| pgAdmin   | http://localhost:5051       | Database admin     |

## Web UI

The React app at http://localhost:3000 lets you view and add users, products, and orders. It talks to the API at localhost:8000 (CORS enabled).

**Run UI in dev mode** (from project root):
```bash
cd src/frontend
npm install
npm run dev
```

## pgAdmin

- **Login:** admin@admin.com / admin
- **Connect to DB:** Host `db`, Port 5432, Database `testdb`, User `test`, Password `test`

## API Endpoints

- `GET /` - Health check
- `GET/POST/DELETE /users` - Users
- `GET/POST/DELETE /products` - Products
- `GET/POST/DELETE /orders` - Orders

## Run Tests Locally (without Docker)

```bash
cd Fast_API/src/backend
pip install -r requirements-test.txt
# Ensure API is running: docker-compose up -d
robot --outputdir tests/results tests/api/
```

## Jenkins CI

The `Jenkinsfile` at `src/Jenkinsfile` runs the API tests in Jenkins.

**Setup:**
1. Install **Robot Framework Plugin** in Jenkins
2. Create a **Pipeline** job
3. Set **Pipeline from SCM** → Git → your repo URL
4. Set **Script Path** to `src/Jenkinsfile`

**Requirements:** Docker and Docker Compose on the Jenkins agent.
