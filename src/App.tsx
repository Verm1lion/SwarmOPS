import { useState } from 'react';
import { PlannerProvider, usePlannerStore } from './hooks/usePlannerStore';
import { Sidebar } from './components/layout/Sidebar';
import { Board } from './components/board/Board';
import { EntryScreen } from './components/entry/EntryScreen';
import { ProjectModal } from './components/board/ProjectModal';
import { isSupabaseConfigured } from './lib/supabaseClient';

function AppContent() {
  const { selectedProjectId, isLoading, createProjectWithJoinCode } = usePlannerStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Supabase is not configured. Please set the following environment variables:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
            <li><code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code></li>
            <li><code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="text-sm text-gray-500">
            Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root with these variables.
          </p>
        </div>
      </div>
    );
  }

  // Show entry screen if no project is selected
  if (!selectedProjectId && !isLoading) {
    return (
      <>
        <EntryScreen onCreateProject={() => setIsCreateModalOpen(true)} />
        <ProjectModal
          project={null}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={async (projectData) => {
            return await createProjectWithJoinCode(projectData);
          }}
          showJoinCode={true}
        />
      </>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show board layout when project is selected
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <Board />
    </div>
  );
}

function App() {
  return (
    <PlannerProvider>
      <AppContent />
    </PlannerProvider>
  );
}

export default App;

