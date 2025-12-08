export type TaskStatus = 'ideas' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type MemberRole = 'member' | 'owner' | 'admin' | 'viewer';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  joinCode: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  displayName: string;
  avatarColor: string;
  role: MemberRole;
  joinedAt: string;
  isSystemAdmin?: boolean;
  deviceSessionId?: string;
  lastSeenAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  taskOrder: number;
  assigneeMemberId: string | null;
  dueDate: string | null;
  statusChangedAt: string;
  completedAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorMemberId: string | null;
  authorNameSnapshot: string;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorMemberId: string | null;
  type: string;
  payload: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  taskId: string;
  actorMemberId: string | null;
  actorName: string;
  type: 'task_assigned' | 'task_mentioned' | 'task_status_changed' | 'comment_added';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  title: string;
  url: string;
  fileType: string | null;
  fileSize: number | null;
  isCover: boolean;
  createdAt: string;
}

