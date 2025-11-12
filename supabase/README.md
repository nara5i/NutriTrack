# Supabase setup

## 1. Configure Environment

Copy `env.example` to `.env.local` and fill in the variables from your Supabase project:

```bash
cp env.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

## 2. Apply schema

Run the SQL in [`schema.sql`](./schema.sql) inside the Supabase SQL editor or through the CLI:

```bash
supabase db push < supabase/schema.sql
```

This creates the required tables:

- `user_profiles`
- `foods`
- `food_logs`
- `rda_targets`
- `daily_summary`

## 3. Seed foods

Populate a starter food catalog:

```bash
supabase db push < supabase/seed_foods.sql
```

You can re-run the seed script as needed; conflicts are avoided by relying on unique constraints.

