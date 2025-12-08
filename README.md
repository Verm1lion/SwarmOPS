# SwarmOPS - Project Management Application

A modern, real-time Kanban board project management application built with React, TypeScript, and Supabase.

## Features

- **Real-time Kanban Board**: Drag and drop tasks across columns (Ideas, To-Do, In Progress, Done)
- **Project Management**: Create projects, join with codes, manage members
- **Task Management**: Create tasks with descriptions, priorities, due dates, and file attachments
- **Comments & Mentions**: Add comments to tasks and mention team members
- **Role-Based Access Control**: Owner, Admin, Member, and Viewer roles
- **Dark Mode**: Toggle between light and dark themes
- **Notifications**: Real-time notifications for task assignments, mentions, and comments
- **Admin Dashboard**: Hidden admin panel for project management
- **Session Persistence**: Automatic session restoration on page refresh

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Storage)
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: lucide-react
- **Date Formatting**: date-fns
- **Routing**: react-router-dom

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SwarmOPS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `complete_database_setup.sql` to create all necessary tables, indexes, and RLS policies
4. Navigate to Storage and create a bucket named `task-attachments` with public read access

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5174`

## Database Setup

Run the SQL script `complete_database_setup.sql` in your Supabase SQL Editor. This script will:

- Create all necessary tables (projects, project_members, tasks, task_comments, etc.)
- Set up indexes for performance
- Configure Row Level Security (RLS) policies
- Create the storage bucket for file attachments

## Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `task-attachments`
3. Set the bucket to public
4. Configure policies:
   - **Public Read**: Allow public read access
   - **Authenticated Insert/Update/Delete**: Allow authenticated users to upload, update, and delete files

## Admin Access

To access the admin dashboard:

1. Go to the entry screen
2. Enter `admin` as the display name
3. Enter `000000` as the join code
4. You'll be redirected to the admin dashboard

## Project Structure

```
src/
├── components/        # React components
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries (Supabase client)
├── types/            # TypeScript type definitions
└── App.tsx           # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Features in Detail

### Kanban Board

- Drag and drop tasks between columns
- Optimistic UI updates for instant feedback
- Real-time synchronization across all users

### Task Management

- Create tasks with title, description, priority, due date
- Assign tasks to team members
- Upload file attachments (PDF, DOC, images, etc.)
- Add comments with file attachments
- View task activity history

### Member Management

- Invite members with join codes
- Assign roles (Owner, Admin, Member, Viewer)
- Manage member permissions
- Edit your own profile (display name, avatar color)

### Notifications

- Real-time notifications for:
  - New task assignments
  - Mentions in comments
  - Status changes
  - New comments

## Troubleshooting

### "Bucket not found" Error

Ensure the `task-attachments` bucket exists in Supabase Storage and has proper policies configured.

### Session Not Persisting

Check browser localStorage permissions. The app stores session data in localStorage.

### Real-time Updates Not Working

Verify that RLS policies are correctly configured in Supabase and that the anon key has proper permissions.

## License

MIT


