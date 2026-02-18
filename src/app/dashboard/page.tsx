import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getDashboardData } from '@/app/actions/dashboard'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
    const { user, isGuest, projects, tasks, stats, recentActivity, velocity, upcomingDeadlines, error } = await getDashboardData()

    if (error === 'Unauthorized') {
        redirect('/login')
    }

    // Allow guest access -> handled by isGuest from action

    return (
        <DashboardClient
            user={user}
            isGuest={isGuest}
            projects={projects}
            tasks={tasks}
            stats={stats}
            recentActivity={recentActivity}
            velocity={velocity}
            upcomingDeadlines={upcomingDeadlines}
        />
    )
}
