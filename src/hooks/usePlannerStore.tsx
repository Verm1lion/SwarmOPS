import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Project, Task, TaskStatus, projectFromRow, taskFromRow, projectToRow, taskToRow } from '../types/domain';
import { supabase } from '../lib/supabaseClient';
import { generateJoinCode } from '../utils/joinCode';

interface PlannerContextType {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  selectProject: (projectId: string | null) => void;
  createProjectWithJoinCode: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'joinCode'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  joinProjectByCode: (joinCode: string) => Promise<void>;
  loadProjectById: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
  getState: () => PlannerContextType;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const LAST_PROJECT_KEY = 'PLANNER_LAST_PROJECT';

function getLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

function setLastProjectId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(LAST_PROJECT_KEY, id);
    } else {
      localStorage.removeItem(LAST_PROJECT_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load last used project on mount
  useEffect(() => {
    const lastProjectId = getLastProjectId();
    if (lastProjectId) {
      loadProjectById(lastProjectId).catch(() => {
        // If loading fails, clear the stored ID
        setLastProjectId(null);
      });
    }
  }, []);

  const loadProjectById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error('Project not found');

      const project = projectFromRow(projectData);

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;

      const loadedTasks = (tasksData || []).map(taskFromRow);

      setProjects([project]);
      setTasks(loadedTasks);
      setSelectedProjectId(id);
      setLastProjectId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinProjectByCode = useCallback(async (joinCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') {
          throw new Error('Project not found. Please check the join code and try again.');
        }
        throw projectError;
      }

      if (!data) {
        throw new Error('Project not found. Please check the join code and try again.');
      }

      await loadProjectById(data.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadProjectById]);

  const refreshTasks = useCallback(async () => {
    if (!selectedProjectId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('task_order', { ascending: true });

      if (error) throw error;

      const loadedTasks = (data || []).map(taskFromRow);
      setTasks(loadedTasks);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  }, [selectedProjectId]);

  const selectProject = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);
    setLastProjectId(projectId);
  }, []);

  const createProjectWithJoinCode = useCallback(async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'joinCode'>
  ): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const joinCode = await generateJoinCode();
      const projectRow = projectToRow({ ...projectData, joinCode });

      const { data, error } = await supabase
        .from('projects')
        .insert(projectRow)
        .select()
        .single();

      if (error) {
        // Provide more helpful error messages
        if (error.code === '42P01') {
          throw new Error('Veritabanı tablosu bulunamadı. Lütfen README.md\'deki SQL komutlarını Supabase\'de çalıştırın.');
        } else if (error.code === '42501') {
          throw new Error('Yetki hatası. RLS (Row Level Security) politikalarını kontrol edin.');
        } else {
          throw new Error(`Veritabanı hatası: ${error.message}`);
        }
      }
      if (!data) throw new Error('Proje oluşturulamadı');

      const project = projectFromRow(data);
      setProjects([project]);
      setTasks([]);
      setSelectedProjectId(project.id);
      setLastProjectId(project.id);

      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setError(null);
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.color !== undefined) updateData.color = updates.color || null;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.filter((t) => t.projectId !== id));
      
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setLastProjectId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw err;
    }
  }, [selectedProjectId]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    setError(null);
    try {
      // Calculate order
      const existingTasks = tasks.filter(
        (t) => t.projectId === taskData.projectId && t.status === taskData.status
      );
      const maxOrder = existingTasks.length > 0
        ? Math.max(...existingTasks.map((t) => t.order))
        : -1;

      const taskRow = taskToRow({ ...taskData, order: maxOrder + 1 });

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskRow)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create task');

      const newTask = taskFromRow(data);
      setTasks((prev) => [...prev, newTask]);

      // Refetch to sync with other users
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw err;
    }
  }, [tasks, refreshTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setError(null);
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.order !== undefined) updateData.task_order = updates.order;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );

      // Refetch to sync with other users
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    }
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTasks((prev) => prev.filter((t) => t.id !== id));

      // Refetch to sync with other users
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw err;
    }
  }, [refreshTasks]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    setError(null);
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const oldStatus = task.status;
      const oldOrder = task.order;

      // Update the moved task
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          task_order: newOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Recalculate orders for affected tasks
      const tasksToUpdate: Array<{ id: string; order: number }> = [];

      // Decrease order for tasks after the old position in the old column
      const oldColumnTasks = tasks.filter(
        (t) => t.projectId === task.projectId && t.status === oldStatus && t.id !== taskId
      );
      oldColumnTasks.forEach((t) => {
        if (t.order > oldOrder) {
          tasksToUpdate.push({ id: t.id, order: t.order - 1 });
        }
      });

      // Increase order for tasks at or after the new position in the new column
      const newColumnTasks = tasks.filter(
        (t) => t.projectId === task.projectId && t.status === newStatus && t.id !== taskId
      );
      newColumnTasks.forEach((t) => {
        if (t.order >= newOrder) {
          tasksToUpdate.push({ id: t.id, order: t.order + 1 });
        }
      });

      // Batch update orders
      if (tasksToUpdate.length > 0) {
        const updates = tasksToUpdate.map(({ id, order }) =>
          supabase
            .from('tasks')
            .update({ task_order: order, updated_at: new Date().toISOString() })
            .eq('id', id)
        );

        await Promise.all(updates);
      }

      // Update local state
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === taskId) {
            return { ...t, status: newStatus, order: newOrder, updatedAt: new Date().toISOString() };
          }
          const update = tasksToUpdate.find((u) => u.id === t.id);
          if (update) {
            return { ...t, order: update.order, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        return updated;
      });

      // Refetch to sync with other users
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      setError(errorMessage);
      throw err;
    }
  }, [tasks, refreshTasks]);

  const getState = useCallback(() => {
    return {
      projects,
      tasks,
      selectedProjectId,
      isLoading,
      error,
      selectProject,
      createProjectWithJoinCode,
      updateProject,
      deleteProject,
      joinProjectByCode,
      loadProjectById,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      refreshTasks,
      getState,
    };
  }, [projects, tasks, selectedProjectId, isLoading, error, selectProject, createProjectWithJoinCode, updateProject, deleteProject, joinProjectByCode, loadProjectById, createTask, updateTask, deleteTask, moveTask, refreshTasks]);

  return (
    <PlannerContext.Provider
      value={{
        projects,
        tasks,
        selectedProjectId,
        isLoading,
        error,
        selectProject,
        createProjectWithJoinCode,
        updateProject,
        deleteProject,
        joinProjectByCode,
        loadProjectById,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        refreshTasks,
        getState,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerStore() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlannerStore must be used within a PlannerProvider');
  }
  return context;
}
