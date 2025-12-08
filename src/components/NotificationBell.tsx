import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { usePlanner } from '../hooks/usePlanner';
import { Bell, X, Check } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

// Safe date parsing helper
function safeParseDate(dateValue: string | null | undefined): Date | null {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { tasks } = usePlanner();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Dispatch event to open task
    if (!notification.taskId) {
      if (import.meta.env.DEV) {
        console.error('Notification missing taskId:', notification);
      }
      return;
    }
    
    const task = tasks.find(t => t.id === notification.taskId);
    if (task) {
      if (import.meta.env.DEV) {
        console.log('Opening task from notification:', task.id, task.title);
      }
      window.dispatchEvent(new CustomEvent('openTask', { detail: task }));
    } else {
      if (import.meta.env.DEV) {
        console.error('Task not found for notification:', {
          notificationId: notification.id,
          taskId: notification.taskId,
          availableTasks: tasks.map(t => ({ id: t.id, title: t.title }))
        });
      }
    }
  };

  const groupNotifications = () => {
    const groups: { [key: string]: any[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    };

    notifications.forEach(notification => {
      const date = safeParseDate(notification.createdAt);
      
      // If date is invalid, add to Older group
      if (!date) {
        groups['Older'].push(notification);
        return;
      }

      try {
        if (isToday(date)) {
          groups['Today'].push(notification);
        } else if (isYesterday(date)) {
          groups['Yesterday'].push(notification);
        } else if (isThisWeek(date)) {
          groups['This Week'].push(notification);
        } else {
          groups['Older'].push(notification);
        }
      } catch {
        // If any date-fns function fails, add to Older group
        groups['Older'].push(notification);
      }
    });

    return groups;
  };

  const groups = groupNotifications();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center size-10 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed w-96 bg-white dark:bg-slate-800 rounded-xl shadow-deep border border-border-light dark:border-border-dark z-[100] max-h-[600px] overflow-hidden flex flex-col"
          style={{
            top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : '64px',
            right: buttonRef.current ? window.innerWidth - buttonRef.current.getBoundingClientRect().right : '16px'
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary hover:opacity-80 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-light-secondary dark:text-text-dark-secondary">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              Object.entries(groups).map(([groupName, groupNotifications]) => {
                if (groupNotifications.length === 0) return null;
                return (
                  <div key={groupName} className="border-b border-border-light dark:border-border-dark last:border-0">
                    <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-900/50">
                      <p className="text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary">
                        {groupName}
                      </p>
                    </div>
                    {groupNotifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-border-light dark:border-border-dark last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-1 ${!notification.isRead ? 'font-semibold' : ''}`}>
                            <p className="text-sm text-text-light-primary dark:text-text-dark-primary">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                              {(() => {
                                const date = safeParseDate(notification.createdAt);
                                if (!date) return 'Unknown date';
                                try {
                                  return format(date, 'MMM d, h:mm a');
                                } catch {
                                  return 'Invalid date';
                                }
                              })()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-border-light dark:border-border-dark">
              <button
                onClick={clearAll}
                className="w-full text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

