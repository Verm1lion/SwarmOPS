import { usePlanner } from '../hooks/usePlanner';
import { useDarkMode } from '../context/DarkModeContext';
import { NotificationBell } from './NotificationBell';
import { Moon, Sun, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { activeProject, members, currentMember, logout, clearProject } = usePlanner();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  
  const isAdmin = currentMember?.isSystemAdmin === true;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    clearProject();
    navigate('/admin');
  };

  if (!activeProject) return <>{children}</>;

  // Filter out admin members for non-admin users
  const visibleMembers = currentMember?.isSystemAdmin 
    ? members 
    : members.filter(m => !m.isSystemAdmin);

  // Get first 2 members for overlapping avatars, then show +N for rest
  const displayMembers = visibleMembers.slice(0, 2);
  const remainingCount = Math.max(0, visibleMembers.length - 2);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary antialiased">
      {/* Animated Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 size-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"></div>
        <div className="absolute -bottom-1/4 -right-1/4 size-1/2 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/10"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 border-b border-solid border-border-light dark:border-border-dark bg-glass-light/80 dark:bg-glass-dark/80 backdrop-blur-xl px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-sm font-medium"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-text-light-primary dark:text-text-dark-primary">
              <span className="material-symbols-outlined text-primary text-3xl">hub</span>
              <h1 className="text-xl font-bold tracking-[-0.015em]">SwarmOPS</h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
              <h2 className="text-lg font-bold">{activeProject.name}</h2>
              <span className="text-xs font-bold bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Overlapping User Avatars */}
            <div className="flex items-center">
              {displayMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="size-10 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800"
                  style={{
                    backgroundColor: member.avatarColor,
                    marginLeft: index > 0 ? '-1rem' : '0',
                    zIndex: displayMembers.length - index
                  }}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-800 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary -ml-4 z-0">
                  +{remainingCount}
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2">
              <NotificationBell />
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center size-10 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary" />
                ) : (
                  <Moon className="w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center size-10 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary" />
              </button>
            </div>
            {/* Main User Avatar */}
            {currentMember && (
              <div
                className="size-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: currentMember.avatarColor }}
                title={currentMember.displayName}
              >
                {currentMember.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
