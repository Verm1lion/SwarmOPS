-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  access_code text unique not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  column_id text not null check (column_id in ('IDEA', 'TODO', 'IN_PROGRESS', 'DONE')),
  priority text check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  created_by text not null, -- Name of the user/guest
  media_urls text[] -- Array of file URLs
);

-- Comments Table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  task_id uuid references tasks(id) on delete cascade not null,
  content text not null,
  author_name text not null
);

-- RLS Policies
alter table projects enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

-- Admin Policies (Authenticated Users)
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Task Policies (Admin sees all in their projects)
create policy "Users can view tasks in their projects"
  on tasks for select
  using (exists (select 1 from projects where projects.id = tasks.project_id and projects.user_id = auth.uid()));

create policy "Users can create tasks in their projects"
  on tasks for insert
  with check (exists (select 1 from projects where projects.id = tasks.project_id and projects.user_id = auth.uid()));

create policy "Users can update tasks in their projects"
  on tasks for update
  using (exists (select 1 from projects where projects.id = tasks.project_id and projects.user_id = auth.uid()));

create policy "Users can delete tasks in their projects"
  on tasks for delete
  using (exists (select 1 from projects where projects.id = tasks.project_id and projects.user_id = auth.uid()));

-- Guest Access (Service Role will bypass RLS, so no specific RLS needed for guests if we use Service Role in Server Actions)
-- However, if we want to allow public read with access code, we'd need more complex RLS.
-- For now, we rely on Server Logic to verify access code before fetching data with Service Role.

-- Storage Bucket for Attachments
insert into storage.buckets (id, name, public) 
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "Public Access to Attachments"
  on storage.objects for select
  using ( bucket_id = 'attachments' );

create policy "Authenticated Users can upload attachments"
  on storage.objects for insert
  with check ( bucket_id = 'attachments' and auth.role() = 'authenticated' );
