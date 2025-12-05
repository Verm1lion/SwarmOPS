# Multi-User Kanban Planner

A collaborative project tracking web app inspired by Microsoft Planner's board view. Built with React, TypeScript, and Supabase for real-time multi-user collaboration. Projects can be shared using join codes.

## Features

- **Multi-User Collaboration**: Share projects with team members using join codes
- **Project Management**: Create, edit, and delete projects with custom names, descriptions, and colors
- **Kanban Board**: Three-column board view (To Do, In Progress, Done) for each project
- **Task Management**: Create, edit, delete, and move tasks between columns
- **Drag & Drop**: Intuitive drag-and-drop to move tasks between columns
- **Task Details**: Set priorities (Low/Medium/High), due dates, and descriptions
- **Search & Filter**: Search tasks by title and filter by status
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Sync**: Changes sync across all users viewing the same project

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- @hello-pangea/dnd (drag and drop)
- Supabase (backend database)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (this is your `VITE_SUPABASE_URL`)
3. Copy your **anon public** key (this is your `VITE_SUPABASE_ANON_KEY`)

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Create Database Tables

Run the following SQL in your Supabase project's SQL Editor (Dashboard → SQL Editor):

```sql
-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  join_code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  due_date date,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  task_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (for Phase 1 - can be restricted later)
CREATE POLICY "Allow anonymous access to projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to tasks" ON tasks
  FOR ALL USING (true);
```

### 5. Verify Setup

After running the SQL, verify the tables were created:
- Go to **Table Editor** in your Supabase dashboard
- You should see `projects` and `tasks` tables

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with your Supabase credentials (see above)

## Development

Start the development server (runs on port 5173, not 3000):

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

To use a different port (e.g., 4000), modify `vite.config.ts`:

```typescript
server: {
  port: 4000
}
```

## Usage

### Creating a Project

1. Click **"Create New Project"** on the entry screen
2. Enter project name, description (optional), and choose a color
3. Click **"Create"**
4. A join code will be displayed (e.g., `ABC123`)
5. Share this code with your collaborators

### Joining a Project

1. Click **"Join Existing Project with code"** on the entry screen
2. Enter the join code provided by the project creator
3. Click **"Join Project"**
4. You'll see the same board as other collaborators

### Working with Tasks

- Click **"Add task"** at the bottom of any column to create a new task
- Click on a task card to edit its details
- Drag and drop tasks between columns to change their status
- Use the search bar to find tasks by title
- Use the status filter dropdown to show only specific statuses

### Task Properties

- **Title**: Required, displayed on the task card
- **Description**: Optional, multiline text
- **Status**: To Do, In Progress, or Done (can be changed via dropdown or drag-and-drop)
- **Due Date**: Optional date picker
- **Priority**: Low (green), Medium (yellow), or High (red)

### Multi-User Behavior

- Changes are automatically synced across all users viewing the same project
- After creating, updating, or moving a task, the board refreshes to show the latest state
- Multiple users can work on the same project simultaneously

## Building for Production

Build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## How Join Codes Work

- Each project has a unique 6-character join code (uppercase letters and digits)
- Join codes are generated automatically when a project is created
- Anyone with the join code can access the project
- Join codes are case-insensitive (automatically converted to uppercase)

## Testing Multi-User Flow

1. Open the app in one browser/window
2. Create a new project and note the join code
3. Open the app in another browser/window (or private/incognito mode)
4. Join the project using the join code
5. Create or move a task in one window
6. Refresh or wait a moment in the other window - you should see the changes

## Data Storage

All data is stored in Supabase:
- Projects are stored in the `projects` table
- Tasks are stored in the `tasks` table
- The app stores the last-used project ID in localStorage for convenience (auto-loads on next visit)

## Project Structure

```
src/
  components/
    board/          # Board-related components
    entry/          # Entry screen (create/join)
    layout/         # Layout components (Sidebar)
    common/         # Shared components (ColorPicker)
  hooks/            # React hooks (usePlannerStore)
  lib/              # Supabase client
  types/            # TypeScript type definitions
  utils/            # Utility functions (join code generation)
  App.tsx           # Root component
  main.tsx          # Entry point
  index.css         # Global styles
```

## Troubleshooting

### "Supabase is not configured" Error

- Make sure you've created `.env.local` in the project root
- Verify the environment variable names are correct: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating/updating `.env.local`

### "Project not found" Error

- Double-check the join code (it's case-insensitive but should match exactly)
- Verify the project exists in your Supabase database

### Changes Not Syncing

- The app refetches tasks after write operations
- If changes don't appear, try refreshing the page
- Check the browser console for any error messages

## License

This is a personal project for collaborative use.
