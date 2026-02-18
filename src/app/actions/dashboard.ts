'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

export async function getDashboardData() {
    const supabase = await createClient()

    // --- DEV BYPASS & GUEST ACCESS ---
    const cookieStore = await cookies()
    const isBypass = cookieStore.get('admin_bypass_session')?.value === 'true'
    const guestCookie = cookieStore.get('guest_session')?.value
    let guestSession = null

    if (guestCookie) {
        try {
            guestSession = JSON.parse(guestCookie)
        } catch (e) {
            console.error('Failed to parse guest session', e)
        }
    }

    let user = null
    let client = supabase

    if (isBypass) {
        user = { id: 'dev-admin', email: 'mert@admin.com (Dev Mode)' }
        client = createAdminClient()
    } else if (guestSession) {
        // Guest Mode: Use Admin Client to fetch only the allowed project
        user = { id: 'guest', email: `guest@${guestSession.projectName}` } // Mock user for UI
        client = createAdminClient()
    } else {
        const { data } = await supabase.auth.getUser()
        user = data.user
    }
    // ------------------

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Fetch Projects
    let projectsQuery = client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    // If Guest, filter by specific project ID
    if (guestSession) {
        projectsQuery = projectsQuery.eq('id', guestSession.projectId)
    }

    const { data: projects, error: projectsError } = await projectsQuery

    if (projectsError) console.error('Projects Error:', projectsError)

    // 2. Fetch Tasks (for all projects)
    const projectIds = projects?.map(p => p.id) || []
    let tasks: any[] = []

    if (projectIds.length > 0) {
        const { data: allTasks, error: tasksError } = await client
            .from('tasks')
            .select('*')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false })

        if (tasksError) console.error('Tasks Error:', tasksError)
        tasks = allTasks || []
    }

    // 3. Calculate Stats
    // Active Projects (All projects are "active" for now)
    const activeProjectsCount = projects?.length || 0

    // Efficiency Score (Completed / Total)
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.column_id === 'DONE').length
    const efficiencyScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Team Load (Requested: 2/10 specifically)
    // In a real scenario, this would be active_users / max_capacity
    const teamLoad = 2 // Hardcoded as requested for now

    // 4. Recent Activity (Latest 5 tasks with improved formatting)
    const recentActivity = tasks.slice(0, 5).map(task => ({
        id: task.id,
        type: 'task_created',
        user: task.created_by, // This is likely an ID, ideally we fetch user name but for now showing ID/Email part if available or "User"
        project_id: task.project_id,
        project_name: projects?.find(p => p.id === task.project_id)?.name || 'Unknown Project',
        content: `created task "${task.title}"`,
        created_at: task.created_at
    }))

    // 5. Weekly Velocity (Tasks created in last 7 days)
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(today.getDate() - i)
        return d.toISOString().split('T')[0]
    }).reverse()

    const velocityData = last7Days.map(date => {
        const count = tasks.filter(t => t.created_at.startsWith(date)).length
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
        return { day: dayName, count, date }
    })

    // 6. Upcoming Deadlines (Mocked for now as 'due_date' might not exist, but prepared)
    // If 'due_date' exists in tasks, use it. Otherwise mock a few if tasks exist.
    // We will simulate deadlines for the latest tasks for demonstration if real dates are missing.
    const upcomingDeadlines = tasks
        .slice(0, 3)
        .map((task, i) => {
            const mockDate = new Date()
            mockDate.setDate(today.getDate() + (i + 1)) // Future dates
            return {
                id: task.id,
                title: task.title,
                project_name: projects?.find(p => p.id === task.project_id)?.name || 'Project',
                due_date: task.due_date || mockDate.toISOString(), // Fallback to mock
                priority: task.priority || 'Medium'
            }
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    return {
        user,
        isGuest: !!guestSession,
        projects: projects || [],
        tasks,
        stats: {
            activeProjects: activeProjectsCount,
            efficiency: efficiencyScore,
            teamLoad, // Will be displayed as 2/10
            totalTasks
        },
        recentActivity,
        velocity: velocityData,
        upcomingDeadlines // Pass this new data
    }
}
