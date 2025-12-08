import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { ChevronDown, Copy, Eye, EyeOff, Plus, Settings, Archive } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, isPast } from 'date-fns';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { ArchiveProjectModal } from './ArchiveProjectModal';

interface ProjectSidebarProps {
  onNewTask: () => void;
}

export function ProjectSidebar({ onNewTask }: ProjectSidebarProps) {
  const { activeProject, tasks, comments } = usePlanner();
  const [joinCodeVisible, setJoinCodeVisible] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [joinCodeOpen, setJoinCodeOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  if (!activeProject) return null;

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(activeProject.joinCode);
  };

  // Calculate statistics
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return isPast(due) && t.status !== 'done';
  }).length;
  
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const completedThisWeek = tasks.filter(t => {
    if (!t.completedAt || t.status !== 'done') return false;
    const completed = new Date(t.completedAt);
    return isWithinInterval(completed, { start: weekStart, end: weekEnd });
  }).length;

  return (
    <aside className="w-[350px] flex-shrink-0 border-l border-solid border-border-light dark:border-border-dark bg-glass-light/80 dark:bg-glass-dark/80 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Project Overview */}
        <details className="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open={overviewOpen}>
          <summary 
            className="flex cursor-pointer list-none items-center justify-between gap-6 p-4"
            onClick={(e) => {
              e.preventDefault();
              setOverviewOpen(!overviewOpen);
            }}
          >
            <p className="font-bold">Project Overview</p>
            <ChevronDown className={`w-5 h-5 transition-transform ${overviewOpen ? 'rotate-180' : ''}`} />
          </summary>
          <div className="px-4 pb-4">
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
              {activeProject.description || 'No description provided.'}
            </p>
          </div>
        </details>

        {/* Join Code */}
        <details className="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open={joinCodeOpen}>
          <summary 
            className="flex cursor-pointer list-none items-center justify-between gap-6 p-4"
            onClick={(e) => {
              e.preventDefault();
              setJoinCodeOpen(!joinCodeOpen);
            }}
          >
            <p className="font-bold">Join Code</p>
            <ChevronDown className={`w-5 h-5 transition-transform ${joinCodeOpen ? 'rotate-180' : ''}`} />
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div className="relative flex items-center justify-center p-4 rounded-lg bg-slate-200/50 dark:bg-slate-900/50 overflow-hidden">
              <p className={`font-mono text-lg font-bold tracking-widest select-none ${joinCodeVisible ? '' : 'blur-sm'}`}>
                {activeProject.joinCode}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setJoinCodeVisible(!joinCodeVisible)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                {joinCodeVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span className="truncate">{joinCodeVisible ? 'Hide' : 'Show'}</span>
              </button>
              <button
                onClick={handleCopyJoinCode}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </details>

        {/* Quick Actions */}
        <details className="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open={actionsOpen}>
          <summary 
            className="flex cursor-pointer list-none items-center justify-between gap-6 p-4"
            onClick={(e) => {
              e.preventDefault();
              setActionsOpen(!actionsOpen);
            }}
          >
            <p className="font-bold">Quick Actions</p>
            <ChevronDown className={`w-5 h-5 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-3">
            <button
              onClick={onNewTask}
              className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-primary text-white gap-2 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>New Task</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary gap-2 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Project Settings</span>
            </button>
            <button
              onClick={() => setShowArchive(true)}
              className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary gap-2 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <Archive className="w-5 h-5" />
              <span>Archive Project</span>
            </button>
          </div>
        </details>

        {/* Statistics */}
        <details className="flex flex-col rounded-xl group border border-border-light dark:border-border-dark bg-slate-500/10 dark:bg-white/10" open={statsOpen}>
          <summary 
            className="flex cursor-pointer list-none items-center justify-between gap-6 p-4"
            onClick={(e) => {
              e.preventDefault();
              setStatsOpen(!statsOpen);
            }}
          >
            <p className="font-bold">Statistics</p>
            <ChevronDown className={`w-5 h-5 transition-transform ${statsOpen ? 'rotate-180' : ''}`} />
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {/* Active Tasks */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
              <div>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Active Tasks</p>
                <p className="text-2xl font-bold">{activeTasks}</p>
              </div>
              <div className="w-20 h-8">
                <svg fill="none" viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 28C10.5 24.5 15.5 12.5 25 10C34.5 7.5 38 18 47 16C56 14 59.5 2 68.5 2" stroke="#2badee" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
              <div>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400">{overdueTasks}</p>
              </div>
              <div className="w-20 h-8">
                <svg fill="none" viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 16H25L47 16L68.5 16" stroke="#f87171" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>

            {/* Completed This Week */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-200/50 dark:bg-slate-900/50">
              <div>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Completed This Week</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedThisWeek}</p>
              </div>
              <div className="w-20 h-8">
                <svg fill="none" viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 30C10.5 28.5 15.5 20.5 25 22C34.5 23.5 38 11 47 11C56 11 59.5 4 68.5 2" stroke="#4ade80" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
          </div>
        </details>
      </div>

      {showSettings && (
        <ProjectSettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showArchive && (
        <ArchiveProjectModal onClose={() => setShowArchive(false)} />
      )}
    </aside>
  );
}

