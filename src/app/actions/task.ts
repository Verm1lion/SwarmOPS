'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createTaskSchema, updateTaskColumnSchema } from '@/lib/schemas'

export async function createTask(formData: FormData) {
    const raw = {
        projectId: formData.get('projectId') as string,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        columnId: formData.get('columnId') as string,
        priority: formData.get('priority') as string,
        createdBy: formData.get('createdBy') as string,
        startDate: formData.get('startDate') as string,
        dueDate: formData.get('dueDate') as string,
        labels: formData.get('labels') as string,
    }

    // Zod Validation
    const parsed = createTaskSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { projectId, title, description, columnId, priority, createdBy, startDate, dueDate, labels } = parsed.data
    const labelArray = labels ? labels.split(',').map(l => l.trim()).filter(Boolean) : []
    const mediaUrls = formData.getAll('media_urls') as string[]

    const adminClient = createAdminClient()

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
            labels: labelArray
        })

    if (error) {
        console.error('Task Create Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/board/${projectId}`)
    return { success: true }
}

export async function updateTaskColumn(taskId: string, newColumnId: string, projectId: string) {
    // Zod Validation
    const parsed = updateTaskColumnSchema.safeParse({ taskId, newColumnId, projectId })
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const adminClient = createAdminClient()

    // Set completed_at when moving to DONE, clear when moving away
    const updateData: Record<string, any> = { column_id: parsed.data.newColumnId }
    if (parsed.data.newColumnId === 'DONE') {
        updateData.completed_at = new Date().toISOString()
    } else {
        updateData.completed_at = null
    }

    const { error } = await adminClient
        .from('tasks')
        .update(updateData)
        .eq('id', parsed.data.taskId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updateTask(
    taskId: string,
    updates: {
        title?: string
        description?: string
        priority?: string
        start_date?: string | null
        due_date?: string | null
        labels?: string[]
    },
    projectId: string
) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('tasks')
        .update(updates)
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
    return { success: true }
}

export async function uploadFile(formData: FormData) {
    const adminClient = createAdminClient()
    const file = formData.get('file') as File
    const path = formData.get('path') as string
    const bucket = 'task-attachments'

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
