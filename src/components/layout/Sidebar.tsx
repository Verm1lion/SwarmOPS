import { useState, useEffect } from 'react';
import { usePlannerStore } from '../../hooks/usePlannerStore';
import { ProjectModal } from '../board/ProjectModal';

const SIDEBAR_STORAGE_KEY = 'PLANNER_SIDEBAR_OPEN';

export function Sidebar() {
  const { projects, selectedProjectId, selectProject, createProjectWithJoinCode, updateProject, deleteProject } = usePlannerStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isDesktopOpen));
    } catch {
      // Ignore localStorage errors
    }
  }, [isDesktopOpen]);

  const handleCreateProject = async (projectData: Omit<Parameters<typeof createProjectWithJoinCode>[0], 'joinCode'>) => {
    try {
      await createProjectWithJoinCode(projectData);
      // Modal will handle showing join code and closing
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = (projectId: string) => {
    setEditingProject(projectId);
    setIsProjectModalOpen(true);
  };

  const handleUpdateProject = async (projectData: Omit<Parameters<typeof createProjectWithJoinCode>[0], 'joinCode'>) => {
    if (editingProject) {
      try {
        await updateProject(editingProject, projectData);
        setEditingProject(null);
        setIsProjectModalOpen(false);
      } catch (error) {
        console.error('Failed to update project:', error);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const editingProjectData = editingProject ? projects.find((p) => p.id === editingProject) : null;

  const toggleDesktopSidebar = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm hover:bg-gray-50"
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>
      </div>
      <div
        className={`fixed lg:static inset-y-0 left-0 bg-white border-r border-gray-200 z-30 transform transition-all duration-200 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopOpen ? 'lg:w-64' : 'lg:w-0 lg:border-r-0'
        }`}
      >
        <div className={`h-full flex flex-col ${!isDesktopOpen ? 'lg:overflow-hidden' : ''}`}>
          <div className={`p-4 border-b border-gray-200 ${!isDesktopOpen ? 'lg:hidden' : ''}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Projects</h2>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Project
            </button>
          </div>
          <div className={`flex-1 overflow-y-auto p-2 ${!isDesktopOpen ? 'lg:hidden' : ''}`}>
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm p-4">No projects yet. Create one to get started!</p>
            ) : (
              <div className="space-y-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`group relative p-3 rounded-md cursor-pointer transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      selectProject(project.id);
                      setIsMobileOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      />
                      <span className="font-medium text-gray-900 truncate flex-1">{project.name}</span>
                    </div>
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project.id);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Edit project"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Desktop Toggle Button */}
      <button
        onClick={toggleDesktopSidebar}
        className={`hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-300 border-l-0 rounded-r-md px-2 py-4 shadow-md hover:bg-gray-50 transition-all duration-200 ${
          isDesktopOpen ? 'translate-x-64' : 'translate-x-0'
        }`}
        title={isDesktopOpen ? 'Sidebar\'ı Kapat' : 'Sidebar\'ı Aç'}
      >
        <span className="text-gray-600 text-lg">
          {isDesktopOpen ? '◀' : '▶'}
        </span>
      </button>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <ProjectModal
        project={editingProjectData}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
        showJoinCode={!editingProject}
      />
    </>
  );
}

