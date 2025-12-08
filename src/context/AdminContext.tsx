import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ProjectMember, MemberRole } from '../types';

interface AdminContextType {
  projects: Project[];
  projectMembers: Record<string, ProjectMember[]>;
  loading: boolean;
  error: string | null;
  fetchAllProjects: () => Promise<void>;
  createProject: (name: string, description: string, color: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  archiveProject: (projectId: string) => Promise<void>;
  unarchiveProject: (projectId: string) => Promise<void>;
  getProjectStats: (projectId: string) => Promise<{ taskCount: number; memberCount: number; lastActivity: string | null }>;
  getProjectMembers: (projectId: string) => Promise<ProjectMember[]>;
  addMemberToProject: (projectId: string, displayName: string, avatarColor: string, role?: MemberRole) => Promise<void>;
  removeMemberFromProject: (projectId: string, memberId: string) => Promise<void>;
  updateMemberInProject: (projectId: string, memberId: string, updates: Partial<ProjectMember>) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const camelObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelObj[camelKey] = typeof obj[key] === 'object' ? toCamelCase(obj[key]) : obj[key];
  }
  return camelObj;
}

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<Record<string, ProjectMember[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProjects((data || []).map(toCamelCase) as Project[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      if (import.meta.env.DEV) {
        console.error('Fetch projects error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description: string, color: string) => {
    setLoading(true);
    setError(null);

    try {
      const joinCode = generateJoinCode();

      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          color,
          join_code: joinCode,
          is_archived: false
        })
        .select()
        .single();

      if (createError) throw createError;

      const newProject = toCamelCase(data) as Project;
      setProjects(prev => [newProject, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      if (import.meta.env.DEV) {
        console.error('Create project error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;

      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
      if (import.meta.env.DEV) {
        console.error('Delete project error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedProject = toCamelCase(data) as Project;
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
    } catch (err: any) {
      setError(err.message || 'Failed to archive project');
      if (import.meta.env.DEV) {
        console.error('Archive project error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const unarchiveProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update({ is_archived: false, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedProject = toCamelCase(data) as Project;
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive project');
      if (import.meta.env.DEV) {
        console.error('Unarchive project error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectStats = useCallback(async (projectId: string) => {
    try {
      // Get task count
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('is_archived', false);

      // Get member count
      const { count: memberCount } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Get last activity (from task_activity or tasks updated_at)
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('updated_at')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      const lastActivity = lastTask?.updated_at || null;

      return {
        taskCount: taskCount || 0,
        memberCount: memberCount || 0,
        lastActivity
      };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Get project stats error:', err);
      }
      return { taskCount: 0, memberCount: 0, lastActivity: null };
    }
  }, []);

  const getProjectMembers = useCallback(async (projectId: string): Promise<ProjectMember[]> => {
    try {
      // Check cache first
      if (projectMembers[projectId]) {
        return projectMembers[projectId];
      }

      const { data, error: fetchError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .order('joined_at', { ascending: true });

      if (fetchError) throw fetchError;

      const members = (data || []).map(toCamelCase) as ProjectMember[];
      setProjectMembers(prev => ({ ...prev, [projectId]: members }));
      return members;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Get project members error:', err);
      }
      return [];
    }
  }, [projectMembers]);

  const addMemberToProject = useCallback(async (projectId: string, displayName: string, avatarColor: string, role: MemberRole = 'member') => {
    try {
      const { data, error: insertError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          display_name: displayName,
          avatar_color: avatarColor,
          role,
          device_session_id: null,
          last_seen_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newMember = toCamelCase(data) as ProjectMember;
      setProjectMembers(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMember]
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
      if (import.meta.env.DEV) {
        console.error('Add member error:', err);
      }
      throw err;
    }
  }, []);

  const removeMemberFromProject = useCallback(async (projectId: string, memberId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId)
        .eq('project_id', projectId);

      if (deleteError) throw deleteError;

      setProjectMembers(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(m => m.id !== memberId)
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
      if (import.meta.env.DEV) {
        console.error('Remove member error:', err);
      }
      throw err;
    }
  }, []);

  const updateMemberInProject = useCallback(async (projectId: string, memberId: string, updates: Partial<ProjectMember>) => {
    try {
      const snakeUpdates: any = {};
      if (updates.displayName !== undefined) snakeUpdates.display_name = updates.displayName;
      if (updates.avatarColor !== undefined) snakeUpdates.avatar_color = updates.avatarColor;
      if (updates.role !== undefined) snakeUpdates.role = updates.role;

      const { data, error: updateError } = await supabase
        .from('project_members')
        .update(snakeUpdates)
        .eq('id', memberId)
        .eq('project_id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedMember = toCamelCase(data) as ProjectMember;
      setProjectMembers(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(m => m.id === memberId ? updatedMember : m)
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
      if (import.meta.env.DEV) {
        console.error('Update member error:', err);
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects]);

  return (
    <AdminContext.Provider
      value={{
        projects,
        projectMembers,
        loading,
        error,
        fetchAllProjects,
        createProject,
        deleteProject,
        archiveProject,
        unarchiveProject,
        getProjectStats,
        getProjectMembers,
        addMemberToProject,
        removeMemberFromProject,
        updateMemberInProject
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

