'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { createProjectSchema } from '@/lib/schemas'

export async function createProject(formData: FormData) {
    const supabase = await createClient()
    const cookieStore = await cookies()

    const { data: { user } } = await supabase.auth.getUser()
    const isBypass = cookieStore.get('admin_bypass_session')?.value === 'true'

    if (!user && !isBypass) {
        redirect('/login')
    }

    const raw = { name: formData.get('name') as string }

    // Zod Validation
    const parsed = createProjectSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const adminClient = createAdminClient()
    let userId = user?.id

    if (!userId && isBypass) {
        const { data: users, error: listError } = await (adminClient.auth.admin as any).listUsers()

        if (listError || !users?.users) {
            return { error: "Dev User lookup failed." }
        }

        const devUser = users.users.find((u: any) => u.email === 'mert@admin.com')

        if (devUser) {
            userId = devUser.id
        } else {
            return { error: "Dev User not found in database." }
        }
    }

    const client = isBypass ? adminClient : supabase

    const { error } = await client
        .from('projects')
        .insert({
            name: parsed.data.name,
            access_code: accessCode,
            user_id: userId
        })

    if (error) {
        console.error('Project Create Error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateProject(projectId: string, updates: { name?: string }) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('projects')
        .update(updates)
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function regenerateAccessCode(projectId: string) {
    const adminClient = createAdminClient()
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await adminClient
        .from('projects')
        .update({ access_code: newCode })
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, code: newCode }
}

export async function deleteProject(formData: FormData) {
    const supabase = await createClient()
    const projectId = formData.get('projectId') as string

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

    if (error) {
        return { error: error.message }
    }
    revalidatePath('/dashboard')
    return { success: true }
}
