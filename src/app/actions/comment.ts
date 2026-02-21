'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createCommentSchema } from '@/lib/schemas'

export async function createComment(taskId: string, content: string, authorName: string, projectId: string) {
    // Zod Validation
    const parsed = createCommentSchema.safeParse({ taskId, content, authorName, projectId })
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('comments')
        .insert({
            task_id: parsed.data.taskId,
            content: parsed.data.content,
            author_name: parsed.data.authorName
        })

    if (error) {
        console.error('Comment Create Error:', error)
        return { error: error.message }
    }

    revalidatePath(`/board/${parsed.data.projectId}`)
    return { success: true }
}

export async function getComments(taskId: string) {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Get Comments Error:', error)
        return []
    }

    return data
}

export async function deleteComment(commentId: string, projectId: string) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/board/${projectId}`)
    return { success: true }
}
