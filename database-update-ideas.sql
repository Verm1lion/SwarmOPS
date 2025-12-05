-- Database Schema Update: Add 'ideas' status to tasks table
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Drop the existing constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Step 2: Add new constraint with 'ideas' included
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('ideas', 'todo', 'in_progress', 'done'));

-- Verify the update
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass
  AND conname = 'tasks_status_check';

