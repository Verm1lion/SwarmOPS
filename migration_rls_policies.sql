-- RLS Policies for SwarmOPS
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 2. Projects: Owner can do everything
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Tasks: Users can manage tasks in their projects
CREATE POLICY "Users can view project tasks"
    ON tasks FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert project tasks"
    ON tasks FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update project tasks"
    ON tasks FOR UPDATE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete project tasks"
    ON tasks FOR DELETE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 4. Comments: Users can manage comments on their project tasks
CREATE POLICY "Users can view task comments"
    ON comments FOR SELECT
    USING (task_id IN (
        SELECT id FROM tasks WHERE project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert comments"
    ON comments FOR INSERT
    WITH CHECK (task_id IN (
        SELECT id FROM tasks WHERE project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (task_id IN (
        SELECT id FROM tasks WHERE project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ));

-- 5. Service Role Bypass (for guest access via admin client)
-- NOTE: service_role key automatically bypasses RLS, so no policy needed.
-- The app uses adminClient for guest operations which already bypasses RLS.
