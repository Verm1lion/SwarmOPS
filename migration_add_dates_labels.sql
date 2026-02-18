-- Run this in Supabase SQL Editor
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS labels text[];
