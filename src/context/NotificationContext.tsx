import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Notification, TaskActivity } from '../types';
import { usePlanner } from '../hooks/usePlanner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Convert task_activity to notification format
function activityToNotification(activity: TaskActivity, actorName: string): Notification | null {
  const payload = activity.payload || {};
  
  let type: Notification['type'] = 'comment_added';
  let message = '';

  switch (activity.type) {
    case 'task_assigned':
      type = 'task_assigned';
      message = `${actorName} assigned you to a task`;
      break;
    case 'task_mentioned':
      type = 'task_mentioned';
      message = `${actorName} mentioned you in a comment`;
      break;
    case 'status_changed':
      type = 'task_status_changed';
      message = `${actorName} changed task status to ${payload.newStatus || 'updated'}`;
      break;
    case 'comment_added':
      type = 'comment_added';
      message = `${actorName} commented on a task`;
      break;
    default:
      return null;
  }

  return {
    id: activity.id,
    taskId: activity.taskId,
    actorMemberId: activity.actorMemberId,
    actorName,
    type,
    message,
    isRead: false, // We'll track this in localStorage for now
    createdAt: activity.createdAt
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { activeProject, currentMember, members, tasks } = usePlanner();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!activeProject || !currentMember) return;

    try {
      // Get all task IDs for this project
      const taskIds = tasks.map(t => t.id);
      if (taskIds.length === 0) {
        setNotifications([]);
        return;
      }

      // Fetch recent task activities for project tasks
      const { data: activities, error } = await supabase
        .from('task_activity')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter activities relevant to current user
      const relevantActivities = (activities || []).filter((activity: TaskActivity) => {
        const payload = activity.payload || {};
        
        // Task assigned to current user
        if (activity.type === 'task_assigned' && payload.assigneeMemberId === currentMember.id) {
          return true;
        }
        
        // Mentioned in comment
        if (activity.type === 'task_mentioned' && payload.mentionedMemberId === currentMember.id) {
          return true;
        }
        
        // Comment on assigned task
        if (activity.type === 'comment_added') {
          const task = tasks.find(t => t.id === activity.taskId);
          if (task?.assigneeMemberId === currentMember.id) {
            return true;
          }
        }
        
        return false;
      });

      // Convert to notifications
      const notificationList: Notification[] = [];
      for (const activity of relevantActivities) {
        const actor = members.find(m => m.id === activity.actorMemberId);
        const actorName = actor?.displayName || 'Someone';
        const notification = activityToNotification(activity, actorName);
        if (notification) {
          // Check if read in localStorage
          const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
          notification.isRead = readNotifications.includes(notification.id);
          notificationList.push(notification);
        }
      }

      setNotifications(notificationList);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching notifications:', err);
      }
    }
  }, [activeProject, currentMember, members, tasks]);

  useEffect(() => {
    if (activeProject && currentMember) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [activeProject, currentMember, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Real-time subscription
  useEffect(() => {
    if (!activeProject) return;

    const channel = supabase
      .channel('task-activity-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_activity'
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeProject, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

