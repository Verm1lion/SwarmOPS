'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

export async function createProject(formData: FormData) {
    const supabase = await createClient()
    const cookieStore = await cookies()

    const { data: { user } } = await supabase.auth.getUser()
    const isBypass = cookieStore.get('admin_bypass_session')?.value === 'true'

    if (!user && !isBypass) {
        redirect('/login')
    }

    const name = formData.get('name') as string
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase() // Generates 6-char random code

    // User ID is needed for the table. 
    // IF bypass, we need a fake or real UUID.
    // Let's use a placeholder UUID if bypass, OR fetch the real user ID purely via Admin API if possible? 
    // No, let's just use a hardcoded UUID or null if schema allows (it likely doesn't).
    // Better: Since 'mert@admin.com' exists in Auth (even if disabled), we can try to fetch it via Admin API?
    // OR just use a random UUID and assume we don't need to join with auth.users for now.
    // Schema says `user_id` uuid. Let's use a hardcoded "Dev Admin" UUID or try to fetch from auth.

    // For simplicity in this "Bypass Mode", we will use the Service Role to insert.
    // And we will use a nil UUID or a specific one if FK constraint exists.
    // Assuming `projects.user_id` references `auth.users.id`.

    // Try to get the real user ID from Supabase Admin!
    const adminClient = createAdminClient()
    let userId = user?.id

    if (!userId && isBypass) {
        // Try to find mert@admin.com to respect FK
        const { data: users, error: listError } = await (adminClient.auth.admin as any).listUsers()

        if (listError || !users?.users) {
            console.error("DEV BYPASS: Error listing users", listError)
            return { error: "Dev User lookup failed." }
        }

        const devUser = users.users.find((u: any) => u.email === 'mert@admin.com')

        if (devUser) {
            userId = devUser.id
        } else {
            // Fallback: If FK exists, this will fail. If FK is loose, it works.
            // We can't easily create a user if provider disabled. 
            // Let's hope the user exists (since they tried to login).
            console.error("DEV BYPASS: Could not find 'mert@admin.com' ID for FK constraint.")
            return { error: "Dev User not found in database. Cannot create project." }
        }
    }

    const client = isBypass ? adminClient : supabase

    const { error } = await client
        .from('projects')
        .insert({
            name,
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
}
