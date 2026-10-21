# HireSphere - Complete Full-Stack Job Portal (Naukri-Inspired)

**HireSphere** is a complete, production-ready full-stack recruitment platform and career discovery portal modeled after **[Naukri.com](https://www.naukri.com/)** with modern aesthetics and a centralized design system.

---

## 📁 Project Structure

```
naukri/
├── package.json              # Root orchestration scripts (dev, build, start, seed)
├── Dockerfile                # Multi-stage production container build
├── docker-compose.yml        # 1-command containerized local/cloud run
├── render.yaml               # 1-click blueprint for Render.com deployment
├── README.md                 # Complete documentation & deployment guide
├── .env.example              # Root environment template
│
├── client/                   # Frontend SPA (React 19, Vite, Tailwind CSS, React Router DOM)
│   ├── index.html            # Brand metadata, SEO tags, Inter Google fonts
│   ├── package.json          # Frontend dependencies
│   ├── vercel.json           # Vercel SPA routing configuration
│   ├── vite.config.js        # Tailwind plugin and /api development proxy
│   ├── .env.example          # Client environment template
│   └── src/
│       ├── components/       # Navbar, Footer, JobCard, SearchBanner, ApplyModal
│       ├── context/          # AuthContext (JWT auth, profile state, session restore)
│       ├── pages/            # Home, Jobs, JobDetail, Companies, Dashboards, Auth
│       ├── utils/            # api.js API fetch client
│       └── index.css         # Centralized brand tokens & custom utilities
│
└── server/                   # Backend API (Express.js, Prisma ORM, JWT, Multer)
    ├── package.json          # Backend dependencies & Prisma scripts
    ├── .env                  # Local server environment config
    ├── .env.example          # Server environment template with PostgreSQL instructions
    ├── prisma/
    │   ├── schema.prisma     # Relational database models
    │   └── seed.js           # Comprehensive sample dataset seed script
    ├── uploads/              # Protected storage for candidate CV uploads
    └── src/
        ├── config/           # Database PrismaClient singleton
        ├── middleware/       # JWT auth & role-based route guards
        ├── routes/           # auth, jobs, applications, recruiter, resumes, admin, etc.
        └── index.js          # Main Express server (serves client/dist in production)
```

---

## ⚡ Quick Start (Local Development)

### 1. Install & Run Dev Server
From the workspace root (`c:\Users\RAO SHAB\Desktop\naukri`):
```bash
# Run both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

- **Frontend (Dev):** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

### 2. Database Reset & Seeding
To re-seed sample jobs, verified companies, candidates, and applications:
```bash
npm run seed
```

---

## 🚀 Production Build & Deployment

HireSphere is designed for flexible deployment:
1. **Unified Monolithic Deployment** (Recommended: Render, Railway, DigitalOcean, Heroku, Docker) - Client and server run together on a single port.
2. **Decoupled Deployment** - Frontend on Vercel/Netlify and Backend on Render/Railway.

### Option 1: Unified Full-Stack Deployment (Render / Railway / VPS)

The Express server automatically detects and serves the built frontend (`client/dist`) and handles client-side SPA routing for all routes.

```bash
# 1. Build frontend:
npm run build

# 2. Start production server:
npm start
```
The entire application (UI + APIs) will be accessible on `http://localhost:5000`!

#### Deploying on Render.com:
- Connect your GitHub repository.
- Select **Web Service**.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Add Environment Variables:
  - `NODE_ENV`: `production`
  - `JWT_SECRET`: (Generate a secure random string)
  - `DATABASE_URL`: `file:./prisma/dev.db` (or PostgreSQL URL)

#### Deploying with Docker:
```bash
# Build and run with Docker Compose:
docker compose up -d --build
```
Access the application at `http://localhost:5000`.

---

### Option 2: Decoupled Deployment (Vercel Frontend + Render Backend)

1. **Backend (on Render/Railway):**
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Set `CLIENT_URL=https://your-frontend.vercel.app`

2. **Frontend (on Vercel):**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variable:
     - `VITE_API_URL=https://your-backend.onrender.com`

---

## 🗄️ Database Switching: SQLite to PostgreSQL

HireSphere uses **SQLite** by default (`server/prisma/dev.db`) for immediate zero-config execution.

To switch to **PostgreSQL** (e.g., Supabase, Neon, AWS RDS, Render Postgres):
1. In [`server/prisma/schema.prisma`](file:///c:/Users/RAO%20SHAB/Desktop/naukri/server/prisma/schema.prisma):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/hiresphere?sslmode=require"
   ```
3. Push schema and seed:
   ```bash
   cd server
   npx prisma db push
   npm run seed
   ```

---

## 🔑 Pre-Seeded Demo Test Accounts

The login page contains **1-click instant login buttons** for all three roles:

| Role | Email | Password | Pre-Loaded Profile |
|---|---|---|---|
| **Candidate** | `candidate@hiresphere.com` | `Password123!` | Rahul Sharma (Senior Full Stack Dev, CV uploaded, 2 applied jobs) |
| **Recruiter (Lead)** | `recruiter@hiresphere.com` | `Password123!` | Priya Nair (Razorpay Talent Acquisition, live tech jobs & applicants) |
| **Recruiter (Tech)** | `recruiter2@hiresphere.com` | `Password123!` | Vikram Mehta (Enterprise Recruiter at Microsoft India) |
| **Administrator** | `admin@hiresphere.com` | `Password123!` | System Governance & Compliance Administrator |
