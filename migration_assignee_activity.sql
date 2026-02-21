-- Migration: Add assigned_to to tasks, create activity_log table
-- Run this in Supabase SQL Editor

-- 1. Add assigned_to column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT NULL;

-- 2. Add position column for task ordering
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 3. Backfill positions based on creation order (per column per project)
WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY project_id, column_id
        ORDER BY created_at ASC
    ) AS pos
    FROM tasks
)
UPDATE tasks SET position = ranked.pos
FROM ranked WHERE tasks.id = ranked.id;

-- 4. Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,           -- 'TASK_CREATED', 'TASK_MOVED', 'TASK_DELETED', 'COMMENT_ADDED', etc.
    entity_type TEXT NOT NULL,      -- 'task', 'comment', 'project'
    entity_id UUID,
    details JSONB DEFAULT '{}',    -- { "title": "...", "from": "TODO", "to": "DONE" }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id, created_at DESC);

-- 6. Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project activity"
    ON activity_log FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can insert activity"
    ON activity_log FOR INSERT
    WITH CHECK (true);
