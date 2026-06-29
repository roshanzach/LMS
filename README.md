# UniLMS

An open-source, production-grade Learning Management System tailored for Indian engineering colleges. UniLMS features native Course Outcome - Program Outcome (CO-PO) mapping analytics, automated attendance systems, and an OBE (Outcome-Based Education) calculations engine.

Built entirely on a zero-cost infrastructure stack (Vercel, Render, Supabase free tier).

## Project Structure

This project is organized as a monorepo using npm workspaces:

```text
uni-lms/
├── apps/
│   ├── web/        # Next.js App Router frontend with Tailwind CSS & Shadcn UI
│   └── api/        # NestJS Backend API
└── packages/
    ├── database/   # Supabase migration schemas (Prisma and SQL DDL)
    └── types/      # Shared TypeScript types & interfaces
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run all apps concurrently:
```bash
npm run dev
```

To run individual workspaces:
```bash
# Frontend
npm run dev --workspace=web

# Backend
npm run dev --workspace=api
```
