# ERP SaaS Starter (Production-Ready Foundation)

Modern ERP SaaS starter with React + Tailwind + Framer Motion + Recharts frontend, and Node.js + Express + Prisma + SQLite backend.

## Included

- JWT auth with register/login/logout/session restore
- Role-based system: Admin, Manager, Staff
- Permission middleware for module-level access
- Protected frontend routes
- Dark glassmorphism professional SaaS layout
- Dashboard with KPI cards, chart placeholders, notifications, activity
- Render-ready backend configuration

## Project Structure

- `backend`: Express API + Prisma + SQLite + JWT
- `frontend`: React app (Vite) + Tailwind + Framer Motion + Recharts

## Setup

1. Copy `.env.example` values into `.env` (root) and adjust secrets (`DATABASE_URL="file:./dev.db"` keeps persistent SQLite data in `backend/prisma/dev.db`).
2. Install all dependencies:
   - `npm run install:all`
3. Initialize Prisma and seed default admin:
   - `npm run db:generate`
   - `npm run db:migrate`
   - `npm run db:seed`
4. Run both apps in development:
   - `npm run dev`

## Default Seed User

- Email: `admin@erp.local`
- Password: `Admin@123`
- Role: `ADMIN`

## Security Notes

- Never commit real secrets to source control
- Set strong `JWT_SECRET` in all environments
- Configure `CLIENT_ORIGIN` for CORS

