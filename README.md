# HireSphere - Professional Job Portal (Naukri-Inspired Architecture)

**HireSphere** is a complete, full-stack recruitment platform and career discovery portal built using [Naukri.com](https://www.naukri.com/) as the design and user flow reference. It features a modern, distinct brand identity with a centralized design system:
- **Primary Color:** Deep Indigo (`#4338CA`)
- **Secondary Color:** Dark Navy (`#172554`)
- **Accent Color:** Teal (`#0D9488`)
- **Page Background:** Light Neutral (`#F8FAFC`)
- **Card Background:** White (`#FFFFFF`)
- **Typography:** Inter (Google Fonts)

---

## Architecture Overview

```
naukri/
├── package.json               # Root scripts orchestrating client & server
├── README.md                  # Project documentation
├── naukri/                    # Frontend (Vite + React 19 + Tailwind CSS)
│   ├── src/
│   │   ├── components/        # Navbar, Footer, JobCard, SearchBanner, ApplyModal
│   │   ├── context/           # AuthContext (JWT session management)
│   │   ├── pages/             # Home, Jobs, JobDetail, Companies, Dashboards, Auth
│   │   ├── utils/             # api.js fetch client with Bearer auth
│   │   ├── index.css          # Centralized brand tokens & utilities
│   │   └── App.jsx            # React Router DOM configuration
│   └── vite.config.js         # Tailwind plugin and /api proxy to port 5000
└── server/                    # Backend (Node.js + Express + Prisma ORM)
    ├── prisma/
    │   ├── schema.prisma      # Relational schema (Users, Jobs, Applications, etc.)
    │   └── seed.js            # Comprehensive demo data seed script
    ├── uploads/               # Secure resume storage (max 5MB, PDF/DOCX)
    └── src/
        ├── middleware/        # JWT requireAuth, requireRole, optionalAuth
        ├── routes/            # auth, jobs, applications, recruiter, admin, etc.
        └── index.js           # Express application entry point
```

---

## Ready-to-Use Demo Accounts

The database comes pre-seeded with realistic data across Indian and global tech hubs (Bengaluru, Hyderabad, Pune, Gurugram, Remote).

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Candidate** | `candidate@hiresphere.com` | `Password123!` | Rahul Sharma (Senior Full Stack Dev, 85% profile score, uploaded CV, 2 applications) |
| **Recruiter (Lead)** | `recruiter@hiresphere.com` | `Password123!` | Priya Nair (Razorpay Talent Acquisition, multiple live tech jobs & applicants) |
| **Recruiter (Tech)** | `recruiter2@hiresphere.com` | `Password123!` | Vikram Mehta (Enterprise Recruiter at Microsoft India) |
| **Administrator** | `admin@hiresphere.com` | `Password123!` | Platform Governance & Compliance Lead |

*Note: The login page includes 1-click quick login buttons to switch between Candidate, Recruiter, and Admin instantly without typing.*

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.15.0)
- **npm** v9+

### 2. Run Locally (Full-Stack Dev Server)
From the workspace root directory:
```bash
npm run dev
```
This automatically launches:
1. Express API Backend on `http://localhost:5000`
2. Vite Frontend on `http://localhost:5173` (or `http://localhost:5174`)

### 3. Re-seeding the Database
To reset and re-populate the sample jobs, applications, and companies:
```bash
npm run seed
```

---

## Database Configuration (SQLite & PostgreSQL)

By default, HireSphere runs out-of-the-box on **SQLite** (`server/prisma/dev.db`), requiring **zero local database daemons or Docker setup**.

### Switching to PostgreSQL
To use PostgreSQL (e.g. Supabase, Neon, or local Postgres):
1. In `server/prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `server/.env`, set your connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hiresphere?schema=public"
   ```
3. Run migrations and seed:
   ```bash
   cd server
   npx prisma db push
   npm run seed
   ```

---

## Implemented Features

### 1. Homepage (`/`)
- Signature 3-field job search banner (Keyword/Title/Company, Experience selector, Location) with real-time autocomplete suggestions.
- Popular trending search pills (Remote, MNC, Freshers, High CTC).
- Top hiring companies grid with verified ratings, reviews, and open vacancy counts.
- Domain category tiles (Engineering, Design, Data Science & GenAI, Cloud/DevOps).
- Fast-Forward career booster section (Resume Score, Free Job Alerts, Recruiter Access).
- Full 5-column Naukri-style footer.

### 2. Job Search & Listing (`/jobs`)
- 2-column layout with responsive filter sidebar:
  - Work Mode (Remote, Hybrid, On-site)
  - Experience (Fresher, 1-3, 3-5, 5-8, 8+ Yrs)
  - Salary in Lakhs Per Annum (3+, 6+, 10+, 15+, 25+, 35+ LPA)
  - Location (Bengaluru, Hyderabad, Pune, Gurugram, Mumbai, Remote)
  - Department (Engineering, Design, Product, etc.)
  - Freshness (Last 24 Hours, 3 Days, 7 Days, 14 Days)
- Live search query summary and removable filter badges.
- Sorting by Relevance, Newest, Salary (High to Low / Low to High).
- Job Cards with company rating, salary in LPA, skills tags, bookmark button, and apply link.
- Pagination controls.

### 3. Job Details Page (`/jobs/:id`)
- Comprehensive overview with salary, location, experience, and openings.
- Rich job description, candidate requirements, and company perks.
- Interactive **Apply Now** modal with resume selector, notice period, and CTC inputs.
- Bookmark save/unsave toggle and shareable link button.
- About Company snapshot with website link.
- Similar opportunities sidebar.

### 4. Candidate Dashboard (`/candidate/dashboard`)
- Dynamic Profile Strength bar (e.g. 85%) with guidance to reach 100%.
- **My Profile:** Edit headline, summary, location, compensation expectations, and interactive skill tags.
- **Resume Manager:** Upload PDF/DOCX resumes (up to 5MB), download resume via authorized endpoint, or delete resume.
- **Applied Jobs:** Real-time application status tracker (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`, `SELECTED`).
- **Saved Jobs:** Bookmarked jobs with 1-click apply.
- **Job Alerts:** Create and toggle search notification alerts.

### 5. Recruiter Dashboard (`/recruiter/dashboard`)
- Metrics: Active Jobs, Total Applicants, Shortlisted Candidates, Total Views.
- **Post a Job:** Full form supporting skills tags, salary in LPA, work arrangement, experience limits.
- **Manage Jobs:** Table of active listings, status toggle (Active/Closed), applicant counts, and delete action.
- **Candidate Applicants:** Filter by job and status, review applicant profile, download CV, and update application status (automatically creates candidate notifications).

### 6. Admin Portal (`/admin`)
- Platform-wide statistics (Users, Jobs, Applications, Companies).
- User Management: Search users, toggle account suspension, and update roles.
- Job Moderation: Inspect and remove inappropriate listings.
- Administrative Audit Logs recording governance actions.
