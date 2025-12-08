-- ============================================
-- SwarmOPS - Complete Database Setup
-- Sıfırdan kurulum için tüm SQL kodları
-- Supabase SQL Editor'de çalıştırın
-- ============================================

-- ============================================
-- PART 1: Storage Bucket Setup
-- ============================================

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create public access policy for reading files
DROP POLICY IF EXISTS "Public Access for Task Attachments" ON storage.objects;
CREATE POLICY "Public Access for Task Attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'task-attachments');

-- Step 3: Create policy for uploading files
DROP POLICY IF EXISTS "Authenticated Upload for Task Attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload for Task Attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments'
);

-- Step 4: Create policy for deleting files
DROP POLICY IF EXISTS "Authenticated Delete for Task Attachments" ON storage.objects;
CREATE POLICY "Authenticated Delete for Task Attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'task-attachments');

-- Step 5: Create policy for updating files
DROP POLICY IF EXISTS "Authenticated Update for Task Attachments" ON storage.objects;
CREATE POLICY "Authenticated Update for Task Attachments"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'task-attachments')
WITH CHECK (bucket_id = 'task-attachments');

-- ============================================
-- PART 2: Cleanup (Sıfırdan kuruyorsak)
-- ============================================

DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS project_labels CASCADE;
DROP TABLE IF EXISTS task_activity CASCADE;
DROP TABLE IF EXISTS comment_mentions CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================
-- PART 3: Create Tables
-- ============================================

-- 1. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    join_code TEXT NOT NULL UNIQUE,
    wip_limits JSONB DEFAULT '{"ideas": null, "todo": null, "in_progress": null, "done": null}',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Project Members (tüm kolonlar dahil)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- member, owner, admin, viewer
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    device_session_id TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    is_system_admin BOOLEAN DEFAULT false,
    UNIQUE(project_id, display_name)
);

-- 3. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('ideas', 'todo', 'in_progress', 'done')),
    due_date DATE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    task_order INTEGER NOT NULL DEFAULT 0,
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assignee_member_id UUID REFERENCES project_members(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Task Comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_member_id UUID REFERENCES project_members(id) ON DELETE SET NULL,
    author_name_snapshot TEXT NOT NULL,
    body TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Comment Mentions
CREATE TABLE comment_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES task_comments(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(comment_id, member_id)
);

-- 6. Task Activity
CREATE TABLE task_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_member_id UUID REFERENCES project_members(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Project Labels
CREATE TABLE project_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Task Labels (Many-to-Many)
CREATE TABLE task_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES project_labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(task_id, label_id)
);

-- 9. Checklist Items
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT false,
    item_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Task Attachments
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PART 4: Create Indexes
-- ============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_join_code ON projects(join_code);
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects(is_archived);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_member_id ON tasks(assignee_member_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON tasks(is_archived);

-- Project Members indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_device_session ON project_members(device_session_id);
CREATE INDEX IF NOT EXISTS idx_project_members_last_seen ON project_members(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_project_members_is_system_admin ON project_members(is_system_admin);
CREATE INDEX IF NOT EXISTS idx_project_members_project_device ON project_members(project_id, device_session_id);

-- Task Comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_member_id ON task_comments(author_member_id);

-- Task Activity indexes
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_actor_member_id ON task_activity(actor_member_id);

-- Task Attachments indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

-- ============================================
-- PART 5: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: Create RLS Policies (Anonim Erişim)
-- ============================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Enable all for anon projects" ON projects;
DROP POLICY IF EXISTS "Enable all for anon members" ON project_members;
DROP POLICY IF EXISTS "Enable all for anon tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all for anon comments" ON task_comments;
DROP POLICY IF EXISTS "Enable all for anon mentions" ON comment_mentions;
DROP POLICY IF EXISTS "Enable all for anon activity" ON task_activity;
DROP POLICY IF EXISTS "Enable all for anon plabels" ON project_labels;
DROP POLICY IF EXISTS "Enable all for anon tlabels" ON task_labels;
DROP POLICY IF EXISTS "Enable all for anon checklist" ON checklist_items;
DROP POLICY IF EXISTS "Enable all for anon attachments" ON task_attachments;

-- Create policies
CREATE POLICY "Enable all for anon projects" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon members" ON project_members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon comments" ON task_comments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon mentions" ON comment_mentions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon activity" ON task_activity FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon plabels" ON project_labels FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon tlabels" ON task_labels FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon checklist" ON checklist_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon attachments" ON task_attachments FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- PART 7: Verification Queries
-- ============================================

-- Verify storage bucket was created
SELECT * FROM storage.buckets WHERE id = 'task-attachments';

-- Verify all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'projects', 'project_members', 'tasks', 'task_comments', 
  'comment_mentions', 'task_activity', 'project_labels', 
  'task_labels', 'checklist_items', 'task_attachments'
)
ORDER BY table_name;

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
  'projects', 'project_members', 'tasks', 'task_comments', 
  'task_activity', 'task_attachments'
)
ORDER BY tablename, indexname;