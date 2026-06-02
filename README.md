# M-Connect — University Student Portal

A full-stack university academic management portal built with Next.js 16, TypeScript, PostgreSQL, Prisma, and NextAuth v5. Students can register courses, view results, pay fees, and receive notifications. Admins and lecturers manage announcements and feedback from a separate staff panel.

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Framework    | Next.js 16 (App Router, Turbopack)      |
| Language     | TypeScript 5.9                          |
| Styling      | Tailwind CSS v4 (dark mode)             |
| Database     | PostgreSQL 16                           |
| ORM          | Prisma 6                                |
| Auth         | NextAuth v5 (JWT, Credentials provider) |
| Forms        | react-hook-form + Zod                   |
| UI           | Radix UI, Lucide React, Sonner toasts   |

---

## Features

### Student Portal (`/dashboard`)
- **Course Registration** — browse courses filtered to department & level; register with one click; unit-load tracking (max 24 units)
- **Academic Results** — view scores, grades, and GPA; filter by session/semester; print transcript
- **Fee Payments** — pay school/hostel/acceptance fees; full payment history with references
- **Notifications** — real-time alerts for results, payments, and announcements; mark as read
- **Feedback** — submit categorised feedback; track resolution status

### Staff Portal (`/admin`)
- **Admin Dashboard** — overview stats (students, lecturers, courses, open feedback, pending fees)
- **Announcements** — publish announcements targeting all users, students only, or lecturers only
- **Feedback Management** — view all submissions; update status (Open → In Progress → Resolved)

### General
- Light / Dark / System theme toggle (no flash on load)
- Fully responsive (mobile sidebar, hamburger menu)
- Role-based routing: `STUDENT`, `LECTURER`, `ADMIN`
- Separate login pages for students (`/login`) and staff (`/login/admin`)

---

## Prerequisites

- Node.js 18+ (tested on 24.x)
- PostgreSQL 16
- npm 9+

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd mconnect
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://mconnect_user:mconnect_pass@localhost:5432/mconnect_db"
NEXTAUTH_SECRET="change-this-to-a-secure-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="change-this-to-a-secure-32-char-secret"
```

### 3. Create the PostgreSQL database

Open `psql` as a superuser and run:

```sql
CREATE USER mconnect_user WITH PASSWORD 'mconnect_pass';
CREATE DATABASE mconnect_db OWNER mconnect_user;
GRANT ALL PRIVILEGES ON DATABASE mconnect_db TO mconnect_user;
```

### 4. Run migrations and seed

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

The seed creates two demo accounts and sample course data for the Computer Science department.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Default Accounts (Development Only)

| Role    | Email                       | Portal         |
|---------|-----------------------------|----------------|
| Student | student@mconnect.edu.ng     | `/login`       |
| Admin   | admin@mconnect.edu.ng       | `/login/admin` |

Default password is set in `prisma/seed.ts`.

> **Change these credentials before deploying to any shared or production environment.**

---

## Project Structure

```
mconnect/
├── prisma/
│   ├── schema.prisma       # DB schema (User, Course, Result, FeePayment, Notification …)
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (dashboard)/    # Student portal routes
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── results/
│   │   │   ├── fees/
│   │   │   ├── notifications/
│   │   │   └── feedback/
│   │   ├── (admin)/        # Staff portal routes
│   │   │   └── admin/
│   │   │       ├── announcements/
│   │   │       └── feedback/
│   │   ├── api/            # Route handlers
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── results/
│   │   │   ├── fees/
│   │   │   ├── notifications/
│   │   │   ├── feedback/
│   │   │   └── admin/
│   │   ├── login/          # Student login
│   │   │   └── admin/      # Staff login
│   │   ├── layout.tsx      # Root layout (theme, toaster)
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # CSS variables for theming
│   ├── auth.ts             # NextAuth config
│   ├── middleware.ts        # Route protection + role guards
│   └── lib/
│       ├── prisma.ts       # Prisma client singleton
│       ├── utils.ts        # cn() helper
│       ├── gpa.ts          # GPA calculator
│       └── date-utils.ts   # formatDistanceToNow
└── public/
    └── favicon.svg
```

---

## API Endpoints

| Method | Path                            | Auth    | Description                      |
|--------|---------------------------------|---------|----------------------------------|
| GET    | /api/courses/available          | Student | Courses for user's dept/level    |
| GET    | /api/courses/enrolled           | Student | User's registered courses        |
| POST   | /api/courses/enroll             | Student | Register a course                |
| GET    | /api/results                    | Student | All results for user             |
| GET    | /api/fees                       | Student | Fee payment history              |
| POST   | /api/fees/initiate              | Student | Initiate & confirm a fee payment |
| GET    | /api/notifications              | Student | All notifications                |
| GET    | /api/notifications/unread-count | Student | Count of unread notifications    |
| PATCH  | /api/notifications/[id]/read    | Student | Mark one notification read       |
| PATCH  | /api/notifications/read-all     | Student | Mark all notifications read      |
| GET    | /api/feedback                   | Student | User's own feedback submissions  |
| POST   | /api/feedback                   | Student | Submit new feedback              |
| GET    | /api/admin/announcements        | Staff   | All announcements                |
| POST   | /api/admin/announcements        | Staff   | Publish new announcement         |
| GET    | /api/admin/feedback             | Staff   | All feedback submissions         |
| PATCH  | /api/admin/feedback/[id]        | Staff   | Update feedback status           |

---

## Security

- Passwords hashed with **bcryptjs** (10 rounds)
- Sessions use **JWT** with a server-side secret
- Fee amounts are **server-side validated** against a fixed schedule — clients cannot manipulate prices
- Duplicate fee payments are blocked server-side (409 Conflict)
- All API routes verify the session before any database access
- Role enforcement in both middleware and page-level guards
- Credential files (`pass.txt`, `*.txt`) are excluded from git via `.gitignore`

---

## Deployment Checklist

- [ ] Set all environment variables on the host (Vercel, Railway, etc.)
- [ ] Update `NEXTAUTH_URL` to your production domain
- [ ] Use a strong random `AUTH_SECRET` — generate with `openssl rand -hex 32`
- [ ] Run `npx prisma migrate deploy` (not `dev`) in production
- [ ] Do **not** run the seed script in production
- [ ] Change default account passwords in `prisma/seed.ts` before first deploy

---

## License

MIT — built as a university prototype project.
