# Smart Traffic Management — OS Visualizer

A React, TypeScript, and Vite learning application demonstrating four Operating Systems concepts in a smart traffic-control scenario:

- CPU Scheduling
- Producer–Consumer synchronization
- Banker's Algorithm
- Memory Management

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project (required for the public community examples board)

## Local setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Copy `.env.example` to `.env.local`.
4. Set the Supabase project URL and anon/publishable key in `.env.local`.
5. Apply the SQL migration in `supabase/migrations/` to your Supabase project.
6. Start the development server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start Vite development server
- `npm run typecheck` — run TypeScript checks
- `npm run lint` — run ESLint
- `npm run build` — typecheck and create the production build
- `npm run preview` — preview the production build locally

## Supabase access model and security

This project currently uses **anonymous public access**, not user login.

- `src/lib/supabase.ts` creates the Supabase browser client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/lib/examples.ts` reads and inserts rows in `real_world_examples`.
- The SQL migration enables Row Level Security (RLS) and grants anonymous/authenticated roles SELECT and INSERT access.
- The policies intentionally allow visitors to read and submit examples. The database checks the allowed algorithm and text lengths.
- No login, signup, password verification, authenticated-user guard, or app-owned session/token flow is implemented.

The anon/publishable key is designed to be present in browser applications. It is not a user password and does not grant administrator access by itself. RLS is essential. Never expose a Supabase `service_role` or secret key in frontend code, a `VITE_*` variable, or a committed file.

Because the current insert policy permits public submissions, add rate limiting, moderation, and anti-spam controls before using this board in a production public service. Do not collect sensitive personal information in visitor examples.

## Deploy to Vercel

1. Push this repository/branch to GitHub.
2. In Vercel, import the GitHub repository.
3. Select the Vite framework preset (or use the checked-in `vercel.json`).
4. Set these environment variables in Vercel Project Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Apply the SQL migration to the matching Supabase project.
6. Deploy. Vercel builds with `npm run build` and serves the `dist` directory.

If the app is deployed without the Supabase variables, the static application can still load, but the community examples feature will show an error when it tries to access Supabase.

## Project structure

- `src/App.tsx` — application shell and module navigation
- `src/components/` — UI and algorithm visualizers
- `src/engine/` — scheduling, synchronization, Banker’s, and memory algorithms
- `src/lib/supabase.ts` — Supabase client configuration
- `src/lib/examples.ts` — community example database operations
- `supabase/migrations/` — database schema and RLS policies
