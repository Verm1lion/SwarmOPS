'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginAdmin(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Attempting login for:', email)

    // --- DEV BYPASS START ---
    // User cannot enable Email Auth in Supabase, so we bypass it for this specific user.
    if (email === 'mert@admin.com' && password === 'mert123') {
        const cookieStore = await cookies()
        cookieStore.set('admin_bypass_session', 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })
        console.log('DEV BYPASS: Admin login success')
        redirect('/dashboard')
    }
    // --- DEV BYPASS END ---

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error.message)
        return { error: error.message }
    }

    console.log('Login Success, redirecting...')
    // Note: redirect throws an error, so it must be outside try/catch if used, 
    // or we let it bubble up. Here we just call it.
    redirect('/dashboard')
}

export async function joinProject(formData: FormData) {
    const adminClient = createAdminClient()

    const accessCode = formData.get('accessCode') as string
    const name = formData.get('name') as string

    // Find project by access code (using Service Role to bypass RLS)
    const { data: project, error } = await adminClient
        .from('projects')
        .select('id, name')
        .eq('access_code', accessCode)
        .single()

    if (error || !project) {
        return { error: 'Geçersiz Join Code' }
    }

    // Set Cookie for Guest Session
    const sessionData = {
        projectId: project.id,
        projectName: project.name,
        guestName: name,
        role: 'guest'
    }

    const cookieStore = await cookies()

    cookieStore.set('guest_session', JSON.stringify(sessionData), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    redirect('/dashboard')
}
