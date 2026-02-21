-- Migration: Add completed_at column to tasks table
-- Run this in Supabase SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill: set completed_at for existing DONE tasks using updated_at
UPDATE tasks SET completed_at = created_at WHERE column_id = 'DONE' AND completed_at IS NULL;
