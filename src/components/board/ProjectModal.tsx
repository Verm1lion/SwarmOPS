import { useState, useEffect } from 'react';
import { Project } from '../../types/domain';
import { ColorPicker } from '../common/ColorPicker';

interface ProjectModalProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'joinCode'>) => Promise<Project | void>;
  showJoinCode?: boolean;
}

export function ProjectModal({ project, isOpen, onClose, onSave, showJoinCode = false }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#3b82f6');
      setCreatedProject(null);
    } else {
      setName('');
      setDescription('');
      setColor('#3b82f6');
      setCreatedProject(null);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await onSave({ name: name.trim(), description: description.trim() || undefined, color });
      if (result && showJoinCode && !project) {
        setCreatedProject(result);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Proje oluşturulamadı. Lütfen tekrar deneyin.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyJoinCode = () => {
    if (createdProject?.joinCode) {
      navigator.clipboard.writeText(createdProject.joinCode);
      alert('Join code copied to clipboard!');
    }
  };

  if (createdProject && showJoinCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">Project Created!</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Share this join code with your collaborators:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-100 rounded-md font-mono text-2xl font-bold text-center">
                {createdProject.joinCode}
              </div>
              <button
                onClick={handleCopyJoinCode}
                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Continue to Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{project ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Color</label>
            <ColorPicker selectedColor={color} onColorChange={setColor} />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Veritabanı tablolarının oluşturulduğundan emin olun. README.md dosyasındaki SQL komutlarını Supabase SQL Editor'de çalıştırın.
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (project ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

