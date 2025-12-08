import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import { NotificationProvider } from './context/NotificationContext';
import { PlannerProvider } from './context/PlannerContext';
import { AdminProvider } from './context/AdminContext';
import { Layout } from './components/Layout';
import { EntryScreen } from './components/EntryScreen';
import { Board } from './components/Board';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePlanner } from './hooks/usePlanner';

function AppContent() {
  const { activeProject, loading } = usePlanner();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!activeProject ? (
        <EntryScreen />
      ) : (
        <Layout>
          <Board />
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DarkModeProvider>
          <AdminProvider>
            <PlannerProvider>
              <NotificationProvider>
                <Routes>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<AppContent />} />
                </Routes>
              </NotificationProvider>
            </PlannerProvider>
          </AdminProvider>
        </DarkModeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
