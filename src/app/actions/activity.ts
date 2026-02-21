'use server'

import { createAdminClient } from '@/utils/supabase/admin'

type ActionType =
    | 'TASK_CREATED'
    | 'TASK_MOVED'
    | 'TASK_DELETED'
    | 'TASK_UPDATED'
    | 'COMMENT_ADDED'
    | 'PROJECT_CREATED'
    | 'PROJECT_DELETED'

export async function logActivity(
    projectId: string,
    userName: string,
    action: ActionType,
    entityType: 'task' | 'comment' | 'project',
    entityId: string | null,
    details: Record<string, any> = {}
) {
    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('activity_log')
        .insert({
            project_id: projectId,
            user_name: userName,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
        })

    if (error) {
        console.error('Activity Log Error:', error)
    }
}

export async function getActivityLog(projectId: string, limit = 20) {
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
        .from('activity_log')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Get Activity Log Error:', error)
        return []
    }

    return data
}
