/**
 * Main App Component
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { LogsPage } from './pages/LogsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ConfigPage } from './pages/ConfigPage';
import { useEffect, useState } from 'react';

// Loading Screen Component
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        {/* Robot Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-accent to-info rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-accent via-info to-success bg-clip-text text-transparent">
            Task Monitor Bot
          </span>
        </h1>

        {/* Loading Message */}
        <p className="text-text-secondary mb-4">{message}</p>

        {/* Loading Spinner */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-info rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-success rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Layout Component
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tasks', icon: '📚' },
    { path: '/logs', label: 'Logs', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/config', label: 'Config', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-info rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold">
                <span className="bg-gradient-to-r from-accent via-info to-success bg-clip-text text-transparent">
                  Task Monitor Bot
                </span>
              </h1>
              <p className="text-xs text-text-muted">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', item.path);
                setCurrentPath(item.path);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.path
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-info rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-secondary">{user?.username}</div>
              <div className="text-xs text-text-muted">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-error/10 hover:bg-error/20 border border-error text-error rounded-md transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function App() {
  const { checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    const initialize = async () => {
      setLoadingMessage('Checking authentication...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      checkAuth();
      
      setLoadingMessage('Loading dashboard...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsInitializing(false);
    };

    initialize();
  }, [checkAuth]);

  if (isInitializing) {
    return <LoadingScreen message={loadingMessage} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HomePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LogsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ConfigPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
