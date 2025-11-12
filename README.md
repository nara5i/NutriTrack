## NutriTrack

NutriTrack helps users log meals, monitor daily calories & macros, and compare progress against personalised Recommended Dietary Allowances.

### Tech Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Supabase (Auth + Postgres)

### Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `env.example` to `.env.local` and populate with your Supabase credentials.
3. Apply the database schema and optional seed data under `supabase/` in your Supabase project.
4. Run the development server
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

### Project Structure Highlights
- `src/lib/supabase/` – browser & server helpers using `@supabase/ssr`
- `src/app/(auth)/` – authentication routes and server actions
- `supabase/` – SQL schema and seed data for required tables

### Supabase SQL
See [`supabase/README.md`](supabase/README.md) for schema and seeding instructions covering:
- `foods`
- `food_logs`
- `rda_targets`
- `daily_summary`
