-- Migration: Add weight_goal column to rda_targets table
-- Run this if your database already exists and needs the new column

alter table public.rda_targets
add column if not exists weight_goal text check (weight_goal in ('maintain', 'loss', 'gain'));

