export type TaskStatus = 'ideas' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

// App types (camelCase)
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  joinCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string | null;
  priority: TaskPriority;
  order: number; // Maps to task_order in DB
  createdAt: string;
  updatedAt: string;
}

// Database types (snake_case)
export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  join_code: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: TaskPriority;
  task_order: number;
  created_at: string;
  updated_at: string;
}

// Type mapping functions
export function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    color: row.color || undefined,
    joinCode: row.join_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectToRow(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: project.name,
    description: project.description || null,
    color: project.color || null,
    join_code: project.joinCode,
  };
}

export function taskFromRow(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    dueDate: row.due_date || null,
    priority: row.priority,
    order: row.task_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function taskToRow(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    project_id: task.projectId,
    title: task.title,
    description: task.description || null,
    status: task.status,
    due_date: task.dueDate || null,
    priority: task.priority,
    task_order: task.order,
  };
}

