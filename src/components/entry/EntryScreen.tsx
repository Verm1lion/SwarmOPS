import { useState } from 'react';
import { usePlannerStore } from '../../hooks/usePlannerStore';

interface EntryScreenProps {
  onCreateProject: () => void;
}

export function EntryScreen({ onCreateProject }: EntryScreenProps) {
  const { joinProjectByCode, isLoading, error } = usePlannerStore();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setJoinError('Please enter a join code');
      return;
    }

    setIsJoining(true);
    try {
      await joinProjectByCode(normalizedCode);
      setJoinCode('');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join project. Please check the code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Kanban Planner</h1>
        <p className="text-gray-600 mb-8 text-center">Collaborate on projects with your team</p>

        <div className="space-y-4">
          <div>
            <button
              onClick={onCreateProject}
              disabled={isLoading || isJoining}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Create New Project
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleJoin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Join Existing Project
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError(null);
                }}
                placeholder="Enter join code (e.g., ABC123)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                disabled={isLoading || isJoining}
                maxLength={8}
              />
              {joinError && (
                <p className="mt-2 text-sm text-red-600">{joinError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || isJoining || !joinCode.trim()}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isJoining ? 'Joining...' : 'Join Project'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

