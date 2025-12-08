import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { X, Archive, AlertTriangle } from 'lucide-react';

interface ArchiveProjectModalProps {
  onClose: () => void;
}

export function ArchiveProjectModal({ onClose }: ArchiveProjectModalProps) {
  const { activeProject, tasks, archiveProject, currentMember } = usePlanner();
  const [confirmText, setConfirmText] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  if (!activeProject || !currentMember) return null;

  const canArchive = currentMember.role === 'owner' || currentMember.role === 'admin';
  if (!canArchive) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <p className="text-gray-900 dark:text-white">You don't have permission to archive this project.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  const activeTasksCount = tasks.filter(t => !t.isArchived).length;
  const projectName = activeProject.name;
  const isConfirmed = confirmText === projectName;

  const handleArchive = async () => {
    if (!isConfirmed) return;
    
    setIsArchiving(true);
    try {
      await archiveProject();
      onClose();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Archive error:', err);
      }
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Archive className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Archive Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                All {activeTasksCount} active tasks will be archived. The project will remain accessible but tasks will be hidden from the board.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              To confirm, please type the project name: <strong>{projectName}</strong>
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={projectName}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              disabled={isArchiving}
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={!isConfirmed || isArchiving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isArchiving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Archiving...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Archive Project
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

