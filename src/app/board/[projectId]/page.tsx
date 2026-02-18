import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import BoardClient from '@/components/board/BoardClient'

export default async function BoardPage({ params }: { params: Promise<{ projectId: string }> }) {
    const supabase = await createClient()
    const { projectId } = await params

    const { data: { user: authUser } } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const guestSessionCookie = cookieStore.get('guest_session')
    const adminBypassCookie = cookieStore.get('admin_bypass_session')

    let isGuest = false
    let guestName = ''
    let isAdmin = !!authUser

    if (!isAdmin && adminBypassCookie?.value === 'true') {
        isAdmin = true
    }

    if (isAdmin) {
        // Admin
    } else if (guestSessionCookie) {
        try {
            const session = JSON.parse(guestSessionCookie.value)
            if (session.projectId !== projectId) {
                redirect('/join')
            }
            isGuest = true
            guestName = session.guestName
        } catch (e) {
            redirect('/join')
        }
    } else {
        redirect('/login')
    }

    const client = (isGuest || (isAdmin && !authUser)) ? createAdminClient() : supabase

    const { data: project } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (!project) {
        return <div>Proje bulunamadı veya erişim reddedildi.</div>
    }

    const { data: tasks } = await client
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    return (
        <BoardClient
            initialTasks={tasks || []}
            projectId={projectId}
            projectName={project.name}
            currentUser={isGuest ? guestName : 'Yönetici'}
            isGuest={isGuest}
        />
    )
}
