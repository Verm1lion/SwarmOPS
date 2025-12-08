import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ProjectMember, Task, TaskComment, TaskStatus, TaskAttachment } from '../types';

interface PlannerContextType {
  activeProject: Project | null;
  tasks: Task[];
  members: ProjectMember[];
  visibleMembers: ProjectMember[]; // Admin'ler hariç member'lar
  comments: TaskComment[];
  currentMember: ProjectMember | null;
  loading: boolean;
  error: string | null;
  loadProject: (joinCode: string, displayName: string, skipDuplicateCheck?: boolean) => Promise<{ needsMerge?: boolean; duplicates?: ProjectMember[]; confidence?: 'high' | 'medium' | 'low'; project?: Project } | void>;
  loadProjectAsAdmin: (projectId: string) => Promise<void>;
  findPotentialDuplicateMembers: (projectId: string, displayName: string, deviceSessionId?: string) => Promise<{ duplicates: ProjectMember[]; confidence: 'high' | 'medium' | 'low' }>;
  mergeMembers: (oldMemberId: string, newMemberId: string) => Promise<void>;
  updateMemberDeviceSession: (memberId: string, deviceSessionId: string) => Promise<void>;
  createProject: (name: string, description: string, color: string, displayName: string) => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  regenerateJoinCode: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'statusChangedAt' | 'completedAt' | 'isArchived'>) => Promise<Task>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, newOrder: number) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  addMember: (displayName: string, avatarColor: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'owner' | 'admin' | 'member' | 'viewer') => Promise<void>;
  updateCurrentMemberProfile: (displayName: string, avatarColor: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  archiveProject: () => Promise<void>;
  addComment: (taskId: string, body: string, files?: File[]) => Promise<void>;
  uploadTaskAttachment: (taskId: string, file: File) => Promise<void>;
  deleteTaskAttachment: (attachmentId: string) => Promise<void>;
  attachments: TaskAttachment[];
  setCurrentMember: (member: ProjectMember | null) => void;
  clearProject: () => void;
  logout: () => void;
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Generate or retrieve device session ID from localStorage
function generateDeviceSessionId(projectId: string): string {
  const storageKey = `swarmops_device_${projectId}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const newSessionId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem(storageKey, newSessionId);
  return newSessionId;
}

// Simple string similarity check
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1;
  if (Math.abs(s1.length - s2.length) > 3) return 0;
  
  let matches = 0;
  const minLen = Math.min(s1.length, s2.length);
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return matches / Math.max(s1.length, s2.length);
}

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

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const snakeObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = typeof obj[key] === 'object' ? toSnakeCase(obj[key]) : obj[key];
  }
  return snakeObj;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [currentMember, setCurrentMember] = useState<ProjectMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // Filter out admin members for non-admin users
  // Also ensure currentMember exists in members list for safety
  const visibleMembers = useMemo(() => {
    if (!currentMember) return [];
    
    // Check if currentMember still exists in members list
    const currentMemberExists = members.some(m => m.id === currentMember.id);
    if (!currentMemberExists && members.length > 0 && import.meta.env.DEV) {
      // Current member not found in members list, but don't clear it yet
      // This might be a temporary sync issue
      console.warn('Current member not found in members list');
    }
    
    // If current user is admin, show all members. Otherwise, hide admin members
    if (currentMember.isSystemAdmin) {
      return members;
    }
    return members.filter(m => !m.isSystemAdmin);
  }, [members, currentMember]);

  // Session persistence helpers
  const saveSessionToStorage = useCallback((project: Project | null, member: ProjectMember | null) => {
    try {
      if (project && member) {
        localStorage.setItem('swarmops_active_project', JSON.stringify(project));
        localStorage.setItem('swarmops_current_member', JSON.stringify(member));
      } else {
        localStorage.removeItem('swarmops_active_project');
        localStorage.removeItem('swarmops_current_member');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to save session to storage:', err);
      }
    }
  }, []);

  const loadSessionFromStorage = useCallback((): { project: Project | null; member: ProjectMember | null } => {
    try {
      const projectStr = localStorage.getItem('swarmops_active_project');
      const memberStr = localStorage.getItem('swarmops_current_member');
      
      if (projectStr && memberStr) {
        const project = JSON.parse(projectStr) as Project;
        const member = JSON.parse(memberStr) as ProjectMember;
        return { project, member };
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Failed to load session from storage:', err);
      }
      // Clear corrupted data
      localStorage.removeItem('swarmops_active_project');
      localStorage.removeItem('swarmops_current_member');
    }
    return { project: null, member: null };
  }, []);

  const clearProject = useCallback(() => {
    setActiveProject(null);
    setTasks([]);
    setMembers([]);
    setComments([]);
    setAttachments([]);
    setCurrentMember(null);
    // Clear session from storage
    saveSessionToStorage(null, null);
  }, [saveSessionToStorage]);

  const logout = useCallback(() => {
    // Clear project state
    clearProject();
    
    // Clear all device session IDs from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('swarmops_device_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear user ID if exists
    localStorage.removeItem('swarmops_user_id');
    
    // Clear session data
    localStorage.removeItem('swarmops_active_project');
    localStorage.removeItem('swarmops_current_member');
  }, [clearProject]);

  const loadProject = useCallback(async (joinCode: string, displayName: string, skipDuplicateCheck: boolean = false) => {
    setLoading(true);
    setError(null);

    // Normalize join code: trim and uppercase (outside try block for error logging)
    const normalizedJoinCode = joinCode.trim().toUpperCase();
    const normalizedDisplayName = displayName.trim();

    try {
      
      if (!normalizedJoinCode) {
        throw new Error('Join code cannot be empty');
      }
      
      if (!normalizedDisplayName) {
        throw new Error('Display name cannot be empty');
      }

      if (import.meta.env.DEV) {
        console.log('Loading project with join code:', normalizedJoinCode);
      }

      // Fetch project (only non-archived)
      // Use case-insensitive comparison by converting both to uppercase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_archived', false);

      if (projectError) {
        throw new Error(`Database error: ${projectError.message}`);
      }

      // Find project with case-insensitive join code match
      const foundProject = projectData?.find((p: any) => 
        p.join_code && p.join_code.trim().toUpperCase() === normalizedJoinCode
      );

      if (!foundProject) {
        if (import.meta.env.DEV) {
          console.log('Project not found. Searched for:', normalizedJoinCode);
          console.log('Available projects:', projectData?.map((p: any) => p.join_code));
        }
        throw new Error('Project not found. Please check the join code and try again.');
      }

      const project = toCamelCase(foundProject) as Project;

      // Generate device session ID
      const deviceSessionId = generateDeviceSessionId(project.id);

      // Check if member already exists with exact name (case-insensitive)
      const { data: allMembers } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id);

      const existingMember = allMembers?.find((m: any) => 
        m.display_name && m.display_name.trim().toLowerCase() === normalizedDisplayName.toLowerCase()
      );

      let member: ProjectMember;
      if (existingMember) {
        member = toCamelCase(existingMember) as ProjectMember;
        // Update device session and last seen
        await updateMemberDeviceSession(member.id, deviceSessionId);
        member = { ...member, deviceSessionId, lastSeenAt: new Date().toISOString() };
      } else {
        // Check for duplicates if not skipping
        if (!skipDuplicateCheck) {
          const { duplicates, confidence } = await findPotentialDuplicateMembers(project.id, normalizedDisplayName, deviceSessionId);
          if (duplicates.length > 0 && confidence !== 'low') {
            // Set activeProject even in merge case so UI can show merge modal
            // The project is valid, we just need to handle duplicate members
            if (import.meta.env.DEV) {
              console.log('Duplicate members found, setting activeProject for merge flow');
            }
            setActiveProject(project);
            // Save project to storage (member will be set after merge)
            saveSessionToStorage(project, null);
            setLoading(false);
            return { needsMerge: true, duplicates, confidence, project };
          }
        }

        // Create new member
        const avatarColor = getRandomAvatarColor();
        const { data: newMember, error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            display_name: normalizedDisplayName,
            avatar_color: avatarColor,
            role: 'member',
            device_session_id: deviceSessionId,
            last_seen_at: new Date().toISOString()
          })
          .select()
          .single();

        if (memberError) throw memberError;
        member = toCamelCase(newMember) as ProjectMember;
      }

      // Only set activeProject after member is successfully created/retrieved
      if (import.meta.env.DEV) {
        console.log('Setting activeProject:', project.name, 'Member:', member.displayName);
      }
      setActiveProject(project);
      setCurrentMember(member);
      // Save session to storage
      saveSessionToStorage(project, member);
      
      if (import.meta.env.DEV) {
        console.log('Project loaded successfully. activeProject set to:', project.id);
      }

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers((membersData || []).map(toCamelCase) as ProjectMember[]);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_archived', false)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks((tasksData || []).map(toCamelCase) as Task[]);

      // Fetch comments for all tasks
      const taskIds = (tasksData || []).map(t => t.id);
      if (taskIds.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from('task_comments')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: true });

        if (!commentsError && commentsData) {
          setComments((commentsData || []).map(toCamelCase) as TaskComment[]);
        }

        // Fetch attachments for all tasks
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('task_attachments')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: true });

        if (!attachmentsError && attachmentsData) {
          setAttachments((attachmentsData || []).map(toCamelCase) as TaskAttachment[]);
        }
      }
    } catch (err: any) {
      // Clear project state on error
      if (import.meta.env.DEV) {
        console.error('Load project error details:', {
          error: err,
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          joinCode: normalizedJoinCode,
          displayName: normalizedDisplayName
        });
      }
      
      setActiveProject(null);
      setCurrentMember(null);
      setMembers([]);
      setTasks([]);
      setComments([]);
      setAttachments([]);
      saveSessionToStorage(null, null);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load project';
      if (err.message) {
        if (err.message.includes('not found') || err.message.includes('Project not found')) {
          errorMessage = 'Project not found. Please check the join code and try again.';
        } else if (err.message.includes('archived')) {
          errorMessage = 'This project has been archived and is no longer available.';
        } else if (err.message.includes('Database error')) {
          errorMessage = 'Database connection error. Please try again.';
        } else if (err.message.includes('permission') || err.message.includes('policy')) {
          errorMessage = 'Permission denied. Please check your access rights.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Load project error:', err);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSessionToStorage]); // findPotentialDuplicateMembers and updateMemberDeviceSession are stable useCallback hooks

  const findPotentialDuplicateMembers = useCallback(async (projectId: string, displayName: string, deviceSessionId?: string): Promise<{ duplicates: ProjectMember[]; confidence: 'high' | 'medium' | 'low' }> => {
    try {
      const duplicates: ProjectMember[] = [];
      let confidence: 'high' | 'medium' | 'low' = 'low';

      // Get all members from the project
      const { data: allMembers, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .order('last_seen_at', { ascending: false });

      if (error || !allMembers) return { duplicates: [], confidence: 'low' };

      const normalizedDisplayName = displayName.toLowerCase().trim();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const member of allMembers) {
        const memberName = member.display_name.toLowerCase().trim();
        const memberLastSeen = member.last_seen_at ? new Date(member.last_seen_at) : null;
        const isRecent = memberLastSeen && memberLastSeen >= sevenDaysAgo;

        // High confidence: Same device session ID
        if (deviceSessionId && member.device_session_id === deviceSessionId) {
          duplicates.push(toCamelCase(member) as ProjectMember);
          confidence = 'high';
          continue;
        }

        // High confidence: Exact name match
        if (memberName === normalizedDisplayName && isRecent) {
          duplicates.push(toCamelCase(member) as ProjectMember);
          confidence = confidence === 'low' ? 'high' : confidence;
          continue;
        }

        // Medium confidence: Similar name (similarity > 0.7)
        const similarity = stringSimilarity(displayName, member.display_name);
        if (similarity > 0.7 && isRecent) {
          duplicates.push(toCamelCase(member) as ProjectMember);
          if (confidence === 'low') confidence = 'medium';
        }
      }

      return { duplicates, confidence };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Find duplicate members error:', err);
      }
      return { duplicates: [], confidence: 'low' };
    }
  }, []);

  const mergeMembers = useCallback(async (oldMemberId: string, newMemberId: string) => {
    try {
      // Update task assignments
      await supabase
        .from('tasks')
        .update({ assignee_member_id: newMemberId })
        .eq('assignee_member_id', oldMemberId);

      // Update comments
      await supabase
        .from('task_comments')
        .update({ author_member_id: newMemberId })
        .eq('author_member_id', oldMemberId);

      // Update activity
      await supabase
        .from('task_activity')
        .update({ actor_member_id: newMemberId })
        .eq('actor_member_id', oldMemberId);

      // Delete old member
      await supabase
        .from('project_members')
        .delete()
        .eq('id', oldMemberId);

      // Update members list
      setMembers(prev => prev.filter(m => m.id !== oldMemberId));
    } catch (err: any) {
      setError(err.message || 'Failed to merge members');
      if (import.meta.env.DEV) {
        console.error('Merge members error:', err);
      }
      throw err;
    }
  }, []);

  const updateMemberDeviceSession = useCallback(async (memberId: string, deviceSessionId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({
          device_session_id: deviceSessionId,
          last_seen_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === memberId 
          ? { ...m, deviceSessionId, lastSeenAt: new Date().toISOString() }
          : m
      ));
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Update member device session error:', err);
      }
    }
  }, []);

  const loadProjectAsAdmin = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        throw new Error('Project not found');
      }

      const project = toCamelCase(projectData) as Project;
      setActiveProject(project);

      // Check if admin member exists
      const { data: existingAdminMember } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .eq('display_name', 'admin')
        .eq('is_system_admin', true)
        .single();

      let adminMember: ProjectMember;
      if (existingAdminMember) {
        adminMember = toCamelCase(existingAdminMember) as ProjectMember;
      } else {
        // Create admin member
        const avatarColor = '#EF4444'; // Red color for admin
        const { data: newAdminMember, error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            display_name: 'admin',
            avatar_color: avatarColor,
            role: 'admin',
            is_system_admin: true
          })
          .select()
          .single();

        if (memberError) throw memberError;
        adminMember = toCamelCase(newAdminMember) as ProjectMember;
      }

      setCurrentMember(adminMember);
      // Save session to storage
      saveSessionToStorage(project, adminMember);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', project.id)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;
      setMembers((membersData || []).map(toCamelCase) as ProjectMember[]);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_archived', false)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks((tasksData || []).map(toCamelCase) as Task[]);

      // Fetch comments
      const taskIds = (tasksData || []).map(t => t.id);
      if (taskIds.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from('task_comments')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: true });

        if (!commentsError && commentsData) {
          setComments((commentsData || []).map(toCamelCase) as TaskComment[]);
        }

        // Fetch attachments
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('task_attachments')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: true });

        if (!attachmentsError && attachmentsData) {
          setAttachments((attachmentsData || []).map(toCamelCase) as TaskAttachment[]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project as admin');
      if (import.meta.env.DEV) {
        console.error('Load project as admin error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description: string, color: string, displayName: string) => {
    setLoading(true);
    setError(null);

    try {
      const joinCode = generateJoinCode();

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          color,
          join_code: joinCode
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const project = toCamelCase(projectData) as Project;
      setActiveProject(project);

      // Create owner member
      const avatarColor = getRandomAvatarColor();
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          display_name: displayName,
          avatar_color: avatarColor,
          role: 'owner'
        })
        .select()
        .single();

      if (memberError) {
        // If member creation fails, clean up the project
        await supabase.from('projects').delete().eq('id', project.id);
        throw memberError;
      }

      const member = toCamelCase(memberData) as ProjectMember;
      setCurrentMember(member);
      setMembers([member]);
      setTasks([]);
      setComments([]);
      setAttachments([]);
      // Save session to storage
      saveSessionToStorage(project, member);
    } catch (err: any) {
      // Clear project state on error
      setActiveProject(null);
      setCurrentMember(null);
      setMembers([]);
      setTasks([]);
      setComments([]);
      setAttachments([]);
      saveSessionToStorage(null, null);
      
      const errorMessage = err.message || 'Failed to create project';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Create project error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [saveSessionToStorage]);

  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!activeProject) return;

    try {
      const snakeUpdates = toSnakeCase(updates);
      const { data, error } = await supabase
        .from('projects')
        .update({ ...snakeUpdates, updated_at: new Date().toISOString() })
        .eq('id', activeProject.id)
        .select()
        .single();

      if (error) throw error;
      const updatedProject = toCamelCase(data) as Project;
      setActiveProject(updatedProject);
      // Update session in storage
      if (currentMember) {
        saveSessionToStorage(updatedProject, currentMember);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
      if (import.meta.env.DEV) {
        console.error('Update project error:', err);
      }
    }
  }, [activeProject, currentMember, saveSessionToStorage]);

  const regenerateJoinCode = useCallback(async () => {
    if (!activeProject || !currentMember) return;
    
    // Only owner/admin can regenerate join code
    if (currentMember.role !== 'owner' && currentMember.role !== 'admin') {
      setError('Only owners and admins can regenerate join code');
      return;
    }

    try {
      const newJoinCode = generateJoinCode();
      const { data, error } = await supabase
        .from('projects')
        .update({ join_code: newJoinCode, updated_at: new Date().toISOString() })
        .eq('id', activeProject.id)
        .select()
        .single();

      if (error) throw error;
      setActiveProject(toCamelCase(data) as Project);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate join code');
      if (import.meta.env.DEV) {
        console.error('Regenerate join code error:', err);
      }
    }
  }, [activeProject, currentMember]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'statusChangedAt' | 'completedAt' | 'isArchived'>): Promise<Task> => {
    if (!activeProject || !currentMember) {
      throw new Error('Active project or current member not found');
    }

    try {
      const snakeData = toSnakeCase(taskData);
      const { data, error: taskError } = await supabase
        .from('tasks')
        .insert({
          ...snakeData,
          project_id: activeProject.id
        })
        .select()
        .single();

      if (taskError) throw taskError;

      const newTask = toCamelCase(data) as Task;
      setTasks(prev => [...prev, newTask].sort((a, b) => a.taskOrder - b.taskOrder));

      // Create activity for task assignment if assignee is set
      if (taskData.assigneeMemberId && taskData.assigneeMemberId !== currentMember.id) {
        await supabase.from('task_activity').insert({
          task_id: newTask.id,
          actor_member_id: currentMember.id,
          type: 'task_assigned',
          payload: { assigneeMemberId: taskData.assigneeMemberId }
        });
      }

      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      if (import.meta.env.DEV) {
        console.error('Create task error:', err);
      }
      throw err;
    }
  }, [activeProject, currentMember]);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    // Optimistic update
    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: newStatus,
            taskOrder: newOrder,
            statusChangedAt: new Date().toISOString(),
            completedAt: newStatus === 'done' ? new Date().toISOString() : null
          };
        }
        // Update order for tasks in the same status
        if (task.status === newStatus && task.taskOrder >= newOrder && task.id !== taskId) {
          return { ...task, taskOrder: task.taskOrder + 1 };
        }
        return task;
      });
      return updated.sort((a, b) => {
        if (a.status !== b.status) return 0;
        return a.taskOrder - b.taskOrder;
      });
    });

    try {
      const updates: any = {
        status: newStatus,
        task_order: newOrder,
        status_changed_at: new Date().toISOString()
      };

      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      if (import.meta.env.DEV) {
        console.error('Update task status error:', err);
      }
      // Reload tasks on error
      if (activeProject) {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', activeProject.id)
          .eq('is_archived', false)
          .order('task_order', { ascending: true });
        if (data) {
          setTasks(data.map(toCamelCase) as Task[]);
        }
      }
    }
  }, [activeProject]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!currentMember) return;

    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    // Optimistic update
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));

    try {
      const snakeUpdates = toSnakeCase(updates);
      const { error } = await supabase
        .from('tasks')
        .update(snakeUpdates)
        .eq('id', taskId);

      if (error) throw error;

      // Create activity for assignment change
      if (updates.assigneeMemberId !== undefined && updates.assigneeMemberId !== oldTask.assigneeMemberId) {
        if (updates.assigneeMemberId && updates.assigneeMemberId !== currentMember.id) {
          await supabase.from('task_activity').insert({
            task_id: taskId,
            actor_member_id: currentMember.id,
            type: 'task_assigned',
            payload: { assigneeMemberId: updates.assigneeMemberId }
          });
        }
      }

      // Create activity for status change
      if (updates.status && updates.status !== oldTask.status) {
        await supabase.from('task_activity').insert({
          task_id: taskId,
          actor_member_id: currentMember.id,
          type: 'status_changed',
          payload: { oldStatus: oldTask.status, newStatus: updates.status }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      if (import.meta.env.DEV) {
        console.error('Update task error:', err);
      }
      // Reload tasks on error
      if (activeProject) {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', activeProject.id)
          .eq('is_archived', false)
          .order('task_order', { ascending: true });
        if (data) {
          setTasks(data.map(toCamelCase) as Task[]);
        }
      }
    }
  }, [activeProject, currentMember, tasks]);

  const addMember = useCallback(async (displayName: string, avatarColor: string) => {
    if (!activeProject) return;

    try {
      const { data, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: activeProject.id,
          display_name: displayName,
          avatar_color: avatarColor,
          role: 'member'
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const newMember = toCamelCase(data) as ProjectMember;
      setMembers(prev => [...prev, newMember]);
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
      if (import.meta.env.DEV) {
        console.error('Add member error:', err);
      }
    }
  }, [activeProject]);

  const updateMemberRole = useCallback(async (memberId: string, role: 'owner' | 'admin' | 'member' | 'viewer') => {
    if (!activeProject) return;

    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      const updatedMember = toCamelCase(data) as ProjectMember;
      setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
    } catch (err: any) {
      setError(err.message || 'Failed to update member role');
      if (import.meta.env.DEV) {
        console.error('Update member role error:', err);
      }
    }
  }, [activeProject]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!activeProject || !currentMember) return;

    // Only owner/admin can remove members
    if (currentMember.role !== 'owner' && currentMember.role !== 'admin') {
      setError('Only owners and admins can remove members');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
      if (import.meta.env.DEV) {
        console.error('Remove member error:', err);
      }
    }
  }, [activeProject, currentMember]);

  const updateCurrentMemberProfile = useCallback(async (displayName: string, avatarColor: string) => {
    if (!currentMember) return;

    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({ display_name: displayName, avatar_color: avatarColor })
        .eq('id', currentMember.id)
        .select()
        .single();

      if (error) throw error;
      const updatedMember = toCamelCase(data) as ProjectMember;
      setCurrentMember(updatedMember);
      setMembers(prev => prev.map(m => m.id === currentMember.id ? updatedMember : m));
      // Update session in storage
      if (activeProject) {
        saveSessionToStorage(activeProject, updatedMember);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      if (import.meta.env.DEV) {
        console.error('Update profile error:', err);
      }
    }
  }, [currentMember, activeProject, saveSessionToStorage]);

  const archiveProject = useCallback(async () => {
    if (!activeProject) return;

    try {
      // Archive the project (soft delete)
      const { error: projectError } = await supabase
        .from('projects')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', activeProject.id);

      if (projectError) throw projectError;

      // Archive all tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ is_archived: true })
        .eq('project_id', activeProject.id)
        .eq('is_archived', false);

      if (tasksError) throw tasksError;

      // Clear project and redirect
      clearProject();
    } catch (err: any) {
      setError(err.message || 'Failed to archive project');
      if (import.meta.env.DEV) {
        console.error('Archive project error:', err);
      }
    }
  }, [activeProject, clearProject]);

  const uploadTaskAttachment = useCallback(async (taskId: string, file: File) => {
    try {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Try to access bucket directly - if it fails, bucket might not exist or have permission issues
      // We'll catch the error during upload if bucket doesn't exist

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Check for bucket-related errors
        const errorMessage = uploadError.message || '';
        if (errorMessage.includes('Bucket not found') || 
            errorMessage.includes('not found') ||
            errorMessage.includes('does not exist')) {
          const errorMsg = 'Storage bucket "task-attachments" not found or not accessible. Please ensure the bucket exists in Supabase Storage and has proper policies configured.';
          setError(errorMsg);
          if (import.meta.env.DEV) {
            console.error('Bucket access error:', uploadError);
          }
          throw new Error(errorMsg);
        }
        // Check for permission errors
        if (errorMessage.includes('permission') || 
            errorMessage.includes('policy') ||
            errorMessage.includes('403') ||
            errorMessage.includes('Forbidden')) {
          const errorMsg = 'Permission denied. Please check storage bucket policies in Supabase Storage settings.';
          setError(errorMsg);
          if (import.meta.env.DEV) {
            console.error('Bucket permission error:', uploadError);
          }
          throw new Error(errorMsg);
        }
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          title: file.name,
          url: urlData.publicUrl,
          file_type: file.type || null,
          file_size: file.size,
          is_cover: false
        })
        .select()
        .single();

      if (error) throw error;

      const newAttachment = toCamelCase(data) as TaskAttachment;
      setAttachments(prev => {
        // Check if already exists to avoid duplicates
        if (prev.find(a => a.id === newAttachment.id)) return prev;
        return [...prev, newAttachment];
      });
      
      if (import.meta.env.DEV) {
        console.log('File uploaded successfully:', newAttachment.title, newAttachment.url);
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to upload file';
      
      // Better error messages for bucket issues
      if (err.message && (err.message.includes('Bucket not found') || err.message.includes('not found'))) {
        errorMessage = 'Storage bucket "task-attachments" not found. Please create it in Supabase Storage settings. See migration_create_storage_bucket.sql for instructions.';
      } else if (err.message && err.message.includes('Storage bucket')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Upload attachment error:', err);
      }
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  const addComment = useCallback(async (taskId: string, body: string, files?: File[]) => {
    if (!currentMember) return;

    try {
      const { data, error: commentError } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          author_member_id: currentMember.id,
          author_name_snapshot: currentMember.displayName,
          body
        })
        .select()
        .single();

      if (commentError) throw commentError;

      const newComment = toCamelCase(data) as TaskComment;
      setComments(prev => [...prev, newComment]);

      // Upload files if provided
      if (files && files.length > 0) {
        for (const file of files) {
          await uploadTaskAttachment(taskId, file);
        }
      }

      // Create activity for comment
      await supabase.from('task_activity').insert({
        task_id: taskId,
        actor_member_id: currentMember.id,
        type: 'comment_added',
        payload: { commentId: newComment.id }
      });

      // Check for mentions (@username pattern)
      // Only allow mentioning visible members (non-admin members for regular users)
      const visibleMembersForMention = currentMember.isSystemAdmin 
        ? members 
        : members.filter(m => !m.isSystemAdmin);
      
      const mentionPattern = /@(\w+)/g;
      const mentions = body.match(mentionPattern);
      if (mentions) {
        for (const mention of mentions) {
          const username = mention.substring(1); // Remove @
          const mentionedMember = visibleMembersForMention.find(m => 
            m.displayName.toLowerCase().includes(username.toLowerCase())
          );
          if (mentionedMember && mentionedMember.id !== currentMember.id) {
            await supabase.from('task_activity').insert({
              task_id: taskId,
              actor_member_id: currentMember.id,
              type: 'task_mentioned',
              payload: { mentionedMemberId: mentionedMember.id, commentId: newComment.id }
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
      if (import.meta.env.DEV) {
        console.error('Add comment error:', err);
      }
    }
  }, [currentMember, members, uploadTaskAttachment]);

  const deleteTaskAttachment = useCallback(async (attachmentId: string) => {
    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      // Delete from storage
      const fileName = attachment.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('task-attachments')
          .remove([`${attachment.taskId}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete attachment');
      if (import.meta.env.DEV) {
        console.error('Delete attachment error:', err);
      }
    }
  }, [attachments]);

  // Real-time subscriptions
  useEffect(() => {
    if (!activeProject) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${activeProject.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTask = toCamelCase(payload.new) as Task;
          setTasks(prev => {
            if (prev.find(t => t.id === newTask.id)) return prev;
            return [...prev, newTask].sort((a, b) => a.taskOrder - b.taskOrder);
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedTask = toCamelCase(payload.new) as Task;
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    const membersChannel = supabase
      .channel('members-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_members',
        filter: `project_id=eq.${activeProject.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMember = toCamelCase(payload.new) as ProjectMember;
          setMembers(prev => {
            if (prev.find(m => m.id === newMember.id)) return prev;
            return [...prev, newMember];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedMember = toCamelCase(payload.new) as ProjectMember;
          setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
          
          // Sync currentMember if it was updated
          if (currentMember && updatedMember.id === currentMember.id) {
            setCurrentMember(updatedMember);
            // Update session in storage
            if (activeProject) {
              saveSessionToStorage(activeProject, updatedMember);
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedMemberId = payload.old.id;
          setMembers(prev => prev.filter(m => m.id !== deletedMemberId));
          
          // If currentMember was deleted, logout the user
          if (currentMember && deletedMemberId === currentMember.id) {
            if (import.meta.env.DEV) {
              console.warn('Current member was deleted, logging out');
            }
            clearProject();
          }
        }
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_comments'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newComment = toCamelCase(payload.new) as TaskComment;
          setComments(prev => {
            if (prev.find(c => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedComment = toCamelCase(payload.new) as TaskComment;
          setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
        } else if (payload.eventType === 'DELETE') {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    const attachmentsChannel = supabase
      .channel('attachments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_attachments'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newAttachment = toCamelCase(payload.new) as TaskAttachment;
          // Only add if it belongs to a task in the current project
          const task = tasks.find(t => t.id === newAttachment.taskId);
          if (task) {
            setAttachments(prev => {
              if (prev.find(a => a.id === newAttachment.id)) return prev;
              return [...prev, newAttachment];
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedAttachment = toCamelCase(payload.new) as TaskAttachment;
          const task = tasks.find(t => t.id === updatedAttachment.taskId);
          if (task) {
            setAttachments(prev => prev.map(a => a.id === updatedAttachment.id ? updatedAttachment : a));
          }
        } else if (payload.eventType === 'DELETE') {
          setAttachments(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(attachmentsChannel);
    };
  }, [activeProject, tasks, currentMember, saveSessionToStorage, clearProject]);

  // Session restore on mount - only run once, don't interfere with loadProject
  useEffect(() => {
    let isMounted = true;
    let hasRestored = false;

    const restoreSession = async () => {
      // Prevent multiple restores
      if (hasRestored || isRestoringSession) {
        return;
      }

      const { project, member } = loadSessionFromStorage();
      
      if (project && member && isMounted) {
        hasRestored = true;
        setIsRestoringSession(true);
        // Set loading to true immediately to prevent flash
        setLoading(true);
        setError(null);
        
        try {
          // Verify project still exists and is not archived
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', project.id)
            .eq('is_archived', false)
            .single();

          if (!isMounted) return;

          if (projectError || !projectData) {
            // Project not found or archived, clear session
            saveSessionToStorage(null, null);
            setActiveProject(null);
            setCurrentMember(null);
            setMembers([]);
            setTasks([]);
            setComments([]);
            setAttachments([]);
            setLoading(false);
            setIsRestoringSession(false);
            return;
          }

          // Verify member still exists
          const { data: memberData, error: memberError } = await supabase
            .from('project_members')
            .select('*')
            .eq('id', member.id)
            .eq('project_id', project.id)
            .single();

          if (!isMounted) return;

          if (memberError || !memberData) {
            // Member not found, clear session
            saveSessionToStorage(null, null);
            setActiveProject(null);
            setCurrentMember(null);
            setMembers([]);
            setTasks([]);
            setComments([]);
            setAttachments([]);
            setLoading(false);
            setIsRestoringSession(false);
            return;
          }

          // Restore session
          const restoredProject = toCamelCase(projectData) as Project;
          const restoredMember = toCamelCase(memberData) as ProjectMember;
          
          if (isMounted) {
            setActiveProject(restoredProject);
            setCurrentMember(restoredMember);

            // Fetch all project data
            try {
              // Fetch members
              const { data: membersData, error: membersError } = await supabase
                .from('project_members')
                .select('*')
                .eq('project_id', restoredProject.id)
                .order('joined_at', { ascending: true });

              if (!isMounted) return;

              if (!membersError && membersData) {
                setMembers((membersData || []).map(toCamelCase) as ProjectMember[]);
              }

              // Fetch tasks
              const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('project_id', restoredProject.id)
                .eq('is_archived', false)
                .order('task_order', { ascending: true });

              if (!isMounted) return;

              if (!tasksError && tasksData) {
                setTasks((tasksData || []).map(toCamelCase) as Task[]);

                // Fetch comments
                const taskIds = tasksData.map(t => t.id);
                if (taskIds.length > 0) {
                  const { data: commentsData } = await supabase
                    .from('task_comments')
                    .select('*')
                    .in('task_id', taskIds)
                    .order('created_at', { ascending: true });

                  if (commentsData) {
                    setComments((commentsData || []).map(toCamelCase) as TaskComment[]);
                  }

                  // Fetch attachments
                  const { data: attachmentsData } = await supabase
                    .from('task_attachments')
                    .select('*')
                    .in('task_id', taskIds)
                    .order('created_at', { ascending: true });

                  if (attachmentsData) {
                    setAttachments((attachmentsData || []).map(toCamelCase) as TaskAttachment[]);
                  }
                }
              }
            } catch (fetchErr: any) {
              // If data fetch fails, still restore session but log error
              if (import.meta.env.DEV) {
                console.error('Failed to restore session data:', fetchErr);
              }
              if (isMounted) {
                setError('Some data could not be loaded. Please refresh the page.');
              }
            }
          }
        } catch (err: any) {
          // Clear everything on error
          if (isMounted) {
            saveSessionToStorage(null, null);
            setActiveProject(null);
            setCurrentMember(null);
            setMembers([]);
            setTasks([]);
            setComments([]);
            setAttachments([]);
            setError('Failed to restore session. Please try again.');
            if (import.meta.env.DEV) {
              console.error('Failed to restore session:', err);
            }
          }
        } finally {
          if (isMounted) {
            setLoading(false);
            setIsRestoringSession(false);
          }
        }
      } else {
        // No session to restore, ensure loading is false
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only restore if no active project is set and not currently loading a project
    if (!activeProject && !loading) {
      restoreSession();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - we intentionally don't include activeProject to avoid loops

  return (
    <PlannerContext.Provider
      value={{
        activeProject,
        tasks,
        members,
        visibleMembers,
        comments,
        currentMember,
        loading,
        error,
        loadProject,
        loadProjectAsAdmin,
        findPotentialDuplicateMembers,
        mergeMembers,
        updateMemberDeviceSession,
        createProject,
        updateProject,
        regenerateJoinCode,
        createTask,
        updateTaskStatus,
        updateTask,
        addMember,
        updateMemberRole,
        removeMember,
        updateCurrentMemberProfile,
        archiveProject,
        addComment,
        uploadTaskAttachment,
        deleteTaskAttachment,
        attachments,
        setCurrentMember,
        clearProject,
        logout
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

