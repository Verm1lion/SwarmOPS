'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { loginSchema, joinProjectSchema } from '@/lib/schemas'

export async function loginAdmin(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const raw = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    // Zod Validation
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { email, password } = parsed.data

    // --- DEV BYPASS START ---
    if (email === 'mert@admin.com' && password === 'mert123') {
        const cookieStore = await cookies()
        cookieStore.set('admin_bypass_session', 'true', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7
        })
        redirect('/dashboard')
    }
    // --- DEV BYPASS END ---

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}

export async function joinProject(formData: FormData) {
    const adminClient = createAdminClient()

    const raw = {
        accessCode: formData.get('accessCode') as string,
        name: formData.get('name') as string,
    }

    // Zod Validation
    const parsed = joinProjectSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { accessCode, name } = parsed.data

    const { data: project, error } = await adminClient
        .from('projects')
        .select('id, name')
        .eq('access_code', accessCode)
        .single()

    if (error || !project) {
        return { error: 'Geçersiz Join Code' }
    }

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
        maxAge: 60 * 60 * 24 * 7
    })

    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Clear all session cookies
    cookieStore.delete('admin_bypass_session')
    cookieStore.delete('guest_session')

    // Sign out from Supabase Auth
    await supabase.auth.signOut()

    redirect('/login')
}
