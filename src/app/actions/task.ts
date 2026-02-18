'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
    const adminClient = createAdminClient() // Use admin/service role to bypass RLS issues for guests

    const projectId = formData.get('projectId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const columnId = formData.get('columnId') as string
    const priority = formData.get('priority') as string
    const createdBy = formData.get('createdBy') as string

    // Parse media_urls (expecting JSON string or handle simple way)
    // For simplicity, let's look for "media_urls" as a serialized array since FormData doesn't support arrays directly easily without multiple keys
    // Client can append multiple "media_urls" keys, then we use getAll.
    const mediaUrls = formData.getAll('media_urls') as string[]

    const { error } = await adminClient
        .from('tasks')
        .insert({
            project_id: projectId,
            title,
            description,
            column_id: columnId,
            priority,
            created_by: createdBy,
            media_urls: mediaUrls
        })

    if (error) {
        console.error('Task Create Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/board/${projectId}`)
    return { success: true }
}

export async function updateTaskColumn(taskId: string, newColumnId: string, projectId: string) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('tasks')
        .update({ column_id: newColumnId })
        .eq('id', taskId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/board/${projectId}`)
    return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        return { error: error.message }
    }
    revalidatePath(`/board/${projectId}`)
}
