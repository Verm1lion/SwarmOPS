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

    const startDate = formData.get('startDate') as string
    const dueDate = formData.get('dueDate') as string
    const labelsString = formData.get('labels') as string
    const labels = labelsString ? labelsString.split(',').map(l => l.trim()).filter(Boolean) : []

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
            media_urls: mediaUrls,
            start_date: startDate || null,
            due_date: dueDate || null,
            labels: labels
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

    // Build update payload: set completed_at when moving to DONE, clear when moving away
    const updateData: Record<string, any> = { column_id: newColumnId }
    if (newColumnId === 'DONE') {
        updateData.completed_at = new Date().toISOString()
    } else {
        updateData.completed_at = null
    }

    const { error } = await adminClient
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)

    if (error) {
        return { error: error.message }
    }

    // NOTE: revalidatePath removed intentionally.
    // The board uses optimistic UI updates via local state,
    // so server-side revalidation is unnecessary and can cause React Error #300.
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

export async function uploadFile(formData: FormData) {
    const adminClient = createAdminClient()
    const file = formData.get('file') as File
    const path = formData.get('path') as string
    const bucket = 'task-attachments' // Hardcoded for security

    if (!file || !path) {
        return { error: 'File or path missing' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await adminClient.storage
        .from(bucket)
        .upload(path, buffer, {
            contentType: file.type,
            upsert: true
        })

    if (error) {
        console.error('Upload Error:', error)
        return { error: error.message }
    }

    const { data: { publicUrl } } = adminClient.storage
        .from(bucket)
        .getPublicUrl(path)

    return { success: true, url: publicUrl }
}

export async function addTaskAttachment(taskId: string, newUrl: string, currentUrls: string[], projectId: string) {
    const adminClient = createAdminClient()
    const updatedUrls = [...(currentUrls || []), newUrl]

    const { error } = await adminClient
        .from('tasks')
        .update({ media_urls: updatedUrls })
        .eq('id', taskId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/board/${projectId}`)
    return { success: true }
}
