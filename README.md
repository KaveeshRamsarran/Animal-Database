# 🌍 WildAtlas — Animal Database

A full-stack wildlife exploration platform featuring an interactive species database, global distribution maps, comparison tools, and regional exploration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL, Alembic |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Leaflet |
| Auth | JWT (python-jose + bcrypt) |
| External APIs | GBIF, iNaturalist, Wikipedia, REST Countries |
| Deployment | Docker Compose, Nginx |

## Features

- **Browse & Search** — Paginated grid with multi-filter support (class, diet, conservation status, environment, biome)
- **Animal Profiles** — Detailed pages with taxonomy, behaviors, fun facts, images, and Wikipedia summaries
- **Interactive Map** — Leaflet-powered map with observation hotspots and per-species distribution
- **Compare Species** — Side-by-side comparison of up to 4 animals
- **Explore by Region** — Browse by continent and country with flag cards
- **Favorites** — Save animals to your personal collection (requires login)
- **Admin Panel** — Trigger data sync jobs, view platform stats
- **20 Pre-seeded Animals** — From African Elephant to Gorilla, each with occurrence coordinates

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Seed the database

```bash
cd backend
python seed.py
```

This creates 20 animals with full data, 7 continents, 7 conservation statuses, 11 behavior categories, and an admin user.

### Default Admin Credentials

- Email: `admin@wildatlas.com`
- Password: `Admin123!`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/animals` | List animals (paginated, filterable) |
| GET | `/api/v1/animals/search?q=` | Search animals |
| GET | `/api/v1/animals/featured` | Featured animals |
| GET | `/api/v1/animals/compare?ids=` | Compare animals |
| GET | `/api/v1/animals/{slug}` | Animal detail |
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login (OAuth2 form) |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/map/hotspots` | Map hotspots |
| GET | `/api/v1/map/distribution/{id}` | Animal distribution |
| GET | `/api/v1/continents` | List continents |
| GET | `/api/v1/countries` | List countries |
| GET | `/api/v1/countries/{code}` | Country detail |
| GET | `/api/v1/countries/{code}/animals` | Animals by country |
| GET | `/api/v1/favorites` | User favorites |
| POST | `/api/v1/favorites` | Add favorite |
| DELETE | `/api/v1/favorites/{id}` | Remove favorite |
| GET | `/api/v1/behaviors` | List behaviors |
| GET | `/api/v1/stats` | Platform stats |
| POST | `/api/v1/admin/sync` | Trigger sync (admin) |
| GET | `/api/v1/admin/sync-jobs` | List sync jobs (admin) |

## Project Structure

```
Animal-Database/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # Route handlers
│   │   ├── core/                # Config, security, dependencies
│   │   ├── db/                  # Database session, base model
│   │   ├── models/              # SQLAlchemy models
│   │   ├── repositories/        # Data access layer
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # External API integrations
│   │   └── main.py
│   ├── alembic/                 # Database migrations
│   ├── tests/                   # pytest test suite
│   ├── seed.py                  # Database seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client layer
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── store/               # Zustand auth store
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Helper functions
│   │   └── App.tsx
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Running Tests

```bash
cd backend
pytest -v
```

Tests use SQLite in-memory database and don't require PostgreSQL.