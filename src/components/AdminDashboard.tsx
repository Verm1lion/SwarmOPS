import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { usePlanner } from '../hooks/usePlanner';
import { useDarkMode } from '../context/DarkModeContext';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Archive, ArchiveRestore, Search, X, ExternalLink, Users, LogOut, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { ProjectMembersModal } from './ProjectMembersModal';

export function AdminDashboard() {
  const { projects, loading, error, createProject, deleteProject, archiveProject, unarchiveProject, getProjectStats } = useAdmin();
  const { loadProjectAsAdmin, logout } = usePlanner();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, { taskCount: number; memberCount: number; lastActivity: string | null }>>({});
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#3B82F6' });

  const handleOpenProject = async (projectId: string) => {
    await loadProjectAsAdmin(projectId);
    // Navigate to home page to show the project board
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Load stats for all projects
    const loadStats = async () => {
      const stats: Record<string, { taskCount: number; memberCount: number; lastActivity: string | null }> = {};
      for (const project of projects) {
        stats[project.id] = await getProjectStats(project.id);
      }
      setProjectStats(stats);
    };
    if (projects.length > 0) {
      loadStats();
    }
  }, [projects, getProjectStats]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.joinCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchiveFilter = showArchived ? project.isArchived : !project.isArchived;
    return matchesSearch && matchesArchiveFilter;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    await createProject(newProject.name, newProject.description, newProject.color);
    setNewProject({ name: '', description: '', color: '#3B82F6' });
    setShowCreateModal(false);
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
              Admin Dashboard
            </h1>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
              Manage all projects and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary" />
            <input
              type="text"
              placeholder="Search projects by name or join code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-glass-light dark:bg-glass-dark focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showArchived
                ? 'bg-primary text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-text-light-primary dark:text-text-dark-primary'
            }`}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">Loading projects...</p>
          </div>
        ) : (
          <div className="bg-glass-light dark:bg-glass-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Join Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-text-light-secondary dark:text-text-dark-secondary">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: project.color || '#3B82F6' }}
                            ></div>
                            <div>
                              <div className="font-bold text-text-light-primary dark:text-text-dark-primary">
                                {project.name}
                              </div>
                              {project.description && (
                                <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                  {project.description}
                                </div>
                              )}
                            </div>
                            {project.isArchived && (
                              <span className="px-2 py-1 text-xs font-bold bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300 rounded-full">
                                ARCHIVED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono">
                            {project.joinCode}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-text-light-primary dark:text-text-dark-primary">
                          {projectStats[project.id]?.taskCount || 0}
                        </td>
                        <td className="px-6 py-4 text-text-light-primary dark:text-text-dark-primary">
                          {projectStats[project.id]?.memberCount || 0}
                        </td>
                        <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary text-sm">
                          {projectStats[project.id]?.lastActivity
                            ? format(new Date(projectStats[project.id].lastActivity!), 'MMM d, yyyy')
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-text-light-secondary dark:text-text-dark-secondary text-sm">
                          {format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenProject(project.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Open Project"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setSelectedProjectForMembers(project)}
                              className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="Manage Members"
                            >
                              <Users className="w-5 h-5" />
                            </button>
                            {project.isArchived ? (
                              <button
                                onClick={() => unarchiveProject(project.id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Unarchive"
                              >
                                <ArchiveRestore className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => archiveProject(project.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                title="Archive"
                              >
                                <Archive className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`)) {
                                  deleteProject(project.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Project Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        newProject.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProjectForMembers && (
        <ProjectMembersModal
          project={selectedProjectForMembers}
          onClose={() => setSelectedProjectForMembers(null)}
        />
      )}
    </div>
  );
}

