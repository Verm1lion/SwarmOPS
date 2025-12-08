import { useState } from 'react';
import { usePlanner } from '../hooks/usePlanner';
import { Plus, LogIn, Loader2 } from 'lucide-react';
import { MemberMergeModal } from './MemberMergeModal';
import { ProjectMember, Project } from '../types';

export function EntryScreen() {
  const { createProject, loadProject, mergeMembers, loading, error, activeProject, currentMember } = usePlanner();
  
  // If activeProject is set, don't render EntryScreen (App.tsx will handle this, but double-check)
  if (activeProject) {
    return null;
  }
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [formData, setFormData] = useState({
    displayName: '',
    projectName: '',
    description: '',
    color: '#3B82F6',
    joinCode: ''
  });
  const [mergeState, setMergeState] = useState<{
    duplicates: ProjectMember[];
    confidence: 'high' | 'medium' | 'low';
    project: Project;
    displayName: string;
    joinCode: string;
  } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.projectName.trim()) {
      return;
    }
    try {
      await createProject(
        formData.projectName,
        formData.description,
        formData.color,
        formData.displayName
      );
    } catch (err) {
      // Error is already handled in createProject
      if (import.meta.env.DEV) {
        console.error('Create project error in EntryScreen:', err);
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.joinCode.trim()) {
      return;
    }
    
    // Normalize join code: trim whitespace and convert to uppercase
    const normalizedJoinCode = formData.joinCode.trim().toUpperCase();
    const normalizedDisplayName = formData.displayName.trim();
    
    // Admin authentication check
    if (normalizedDisplayName.toLowerCase() === 'admin' && normalizedJoinCode === '000000') {
      // Redirect to admin dashboard
      window.location.href = '/admin';
      return;
    }
    
    if (import.meta.env.DEV) {
      console.log('Attempting to join project with code:', normalizedJoinCode);
    }
    
    try {
      const result = await loadProject(normalizedJoinCode, normalizedDisplayName);
      if (result && 'needsMerge' in result && result.needsMerge) {
        setMergeState({
          duplicates: result.duplicates || [],
          confidence: result.confidence || 'low',
          project: result.project!,
          displayName: normalizedDisplayName,
          joinCode: normalizedJoinCode
        });
      }
    } catch (err) {
      // Error is already handled in loadProject
      if (import.meta.env.DEV) {
        console.error('Load project error in EntryScreen:', err);
      }
    }
  };

  const handleMerge = async (oldMemberId: string) => {
    if (!mergeState) return;
    
    try {
      // First, create the new member by loading project with skipDuplicateCheck
      await loadProject(mergeState.joinCode, mergeState.displayName, true);
      
      // Wait a bit for the member to be created and set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use currentMember from hook
      if (currentMember && currentMember.id) {
        await mergeMembers(oldMemberId, currentMember.id);
      }
      setMergeState(null);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Merge error:', err);
      }
      setMergeState(null);
    }
  };

  const handleSkipMerge = async () => {
    if (!mergeState) return;
    await loadProject(mergeState.joinCode, mergeState.displayName, true);
    setMergeState(null);
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SwarmOPS</h1>
          <p className="text-gray-600">Project Management Made Simple</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Project
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'join'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Join Project
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    Hata
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                  title="Sayfayı Yenile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={mode === 'create' ? handleCreate : handleJoin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad-Soyad (Display Name)
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {mode === 'create' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="My Awesome Project"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Project description..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            formData.color === color
                              ? 'border-gray-900 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Join Code
                  </label>
                  <input
                    type="text"
                    value={formData.joinCode}
                    onChange={(e) => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                    placeholder="ABC12345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Joining...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create Project' : 'Join Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {mergeState && (
        <MemberMergeModal
          duplicates={mergeState.duplicates}
          confidence={mergeState.confidence}
          onMerge={handleMerge}
          onSkip={handleSkipMerge}
        />
      )}
    </div>
  );
}

