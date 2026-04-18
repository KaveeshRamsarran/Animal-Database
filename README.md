# 🌍 WildAtlas — Animal Database

A full-stack wildlife exploration platform featuring 244 species, an interactive species database, global distribution maps, comparison tools, and regional exploration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL, Alembic |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Leaflet |
| Auth | JWT (python-jose + bcrypt) |
| External APIs | GBIF, iNaturalist, Wikipedia, REST Countries |
| Deployment | Docker Compose, Render, Nginx |

## Features

- **Browse & Search** — Paginated A-Z grid with multi-filter support (class, diet, conservation status, environment, biome)
- **Animal Profiles** — Detailed pages with taxonomy, behaviors, fun facts, images, and Wikipedia summaries
- **Interactive Map** — Leaflet-powered map with observation hotspots and per-species distribution
- **Compare Species** — Side-by-side comparison of up to 4 animals
- **Explore by Region** — Browse by continent and country with flag cards
- **Favorites** — Save animals to your personal collection (requires login)
- **Admin Panel** — Trigger data sync jobs, view platform stats
- **244 Pre-seeded Animals** — From Aardvark to Zebra, each with images, occurrence coordinates, and full profiles

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

---

## Deploying to Render

This project includes a `render.yaml` blueprint for one-click deployment on [Render](https://render.com). It provisions three services:

| Service | Type | Plan |
|---------|------|------|
| **wildatlas-api** | Web Service (Docker) | Free / Starter ($7/mo) |
| **wildatlas-frontend** | Static Site | Free |
| **wildatlas-db** | PostgreSQL | Free (1 GB) |

### Prerequisites

1. A [Render account](https://dashboard.render.com/register)
2. Your code pushed to a GitHub (or GitLab) repository

### Step-by-Step Deployment

#### 1. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/Animal-Database.git
git push -u origin main
```

#### 2. Create a PostgreSQL database on Render

1. Go to **Render Dashboard → New → PostgreSQL**
2. Set:
   - **Name**: `wildatlas-db`
   - **Database**: `wildatlas`
   - **User**: `wildatlas`
   - **Plan**: Free (or Starter for persistence beyond 90 days)
3. Click **Create Database**
4. Once created, copy the **Internal Database URL** (starts with `postgresql://`)
5. You'll also need the **External Database URL** for seeding

#### 3. Deploy the Backend API

1. Go to **Render Dashboard → New → Web Service**
2. Connect your GitHub repo
3. Set:
   - **Name**: `wildatlas-api`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Plan**: Free (or Starter for always-on)
4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql+asyncpg://wildatlas:<password>@<host>/wildatlas` *(from step 2, replace `postgresql://` with `postgresql+asyncpg://`)* |
   | `DATABASE_URL_SYNC` | `postgresql+psycopg2://wildatlas:<password>@<host>/wildatlas` *(same, but use `postgresql+psycopg2://`)* |
   | `JWT_SECRET_KEY` | *(click "Generate" for a random secret)* |
   | `ADMIN_EMAIL` | `admin@wildatlas.com` |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | *(choose a strong password)* |
   | `CORS_ORIGINS` | `["https://wildatlas-frontend.onrender.com"]` |

   > **Important**: Render's database connection string starts with `postgresql://`. You must change the scheme:
   > - For `DATABASE_URL`: use `postgresql+asyncpg://`
   > - For `DATABASE_URL_SYNC`: use `postgresql+psycopg2://`
   > 
   > Also use the **Internal URL** (not External) since the backend and database are on Render's internal network.

5. Click **Create Web Service**
6. Wait for the first deploy to complete (the backend auto-creates database tables on startup)

#### 4. Seed the Database

After the backend deploys, seed it with animal data. You can do this from your local machine:

```bash
# Set DATABASE_URL to the *External* Render database URL
export DATABASE_URL="postgresql+asyncpg://wildatlas:<password>@<external-host>/wildatlas"
export DATABASE_URL_SYNC="postgresql+psycopg2://wildatlas:<password>@<external-host>/wildatlas"

cd backend
pip install -r requirements.txt
python seed.py
```

Or use Render's **Shell** tab on the backend service:

```bash
python seed.py
```

#### 5. Deploy the Frontend

1. Go to **Render Dashboard → New → Static Site**
2. Connect the same GitHub repo
3. Set:
   - **Name**: `wildatlas-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://wildatlas-api.onrender.com/api/v1` |

   > Replace `wildatlas-api` with your actual backend service name if different.

5. Add a **Rewrite Rule**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

   This enables client-side routing (React Router).

6. Click **Create Static Site**

#### 6. Verify Deployment

- **Frontend**: `https://wildatlas-frontend.onrender.com`
- **Backend API**: `https://wildatlas-api.onrender.com/docs`
- **Health check**: `https://wildatlas-api.onrender.com/health`

### One-Click Deploy (Blueprint)

Alternatively, use the included `render.yaml` for automatic provisioning:

1. Go to [Render Blueprint](https://dashboard.render.com/select-repo?type=blueprint)
2. Select your repo — Render detects `render.yaml` and provisions all services
3. After deployment, **manually fix** the `DATABASE_URL` env var on the backend service:
   - Change `postgresql://` to `postgresql+asyncpg://`
4. Redeploy the backend, then seed the database via Shell

### Custom Domain (Optional)

1. In Render, go to your frontend Static Site → **Settings → Custom Domains**
2. Add your domain (e.g., `wildatlas.yourdomain.com`)
3. Update DNS: add a CNAME record pointing to `wildatlas-frontend.onrender.com`
4. Render auto-provisions a free SSL certificate via Let's Encrypt
5. Update the backend's `CORS_ORIGINS` env var to include your custom domain

### Cost Summary

| Tier | Backend | Frontend | Database | Total |
|------|---------|----------|----------|-------|
| **Free** | Free (spins down after inactivity) | Free (CDN) | Free (1 GB, 90-day expiry) | **$0/mo** |
| **Starter** | $7/mo (always-on) | Free | $7/mo (persistent) | **$14/mo** |

> **Note**: On the Free tier, the backend spins down after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds. Upgrade to Starter to avoid this.