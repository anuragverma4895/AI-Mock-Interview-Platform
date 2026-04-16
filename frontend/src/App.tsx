import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { ParticleEffect } from './components/ParticleEffect';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import ResumeUpload from './pages/ResumeUpload';
import Analytics from './pages/Analytics';
import InterviewResult from './pages/InterviewResult';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  const { checkToken } = useAuthStore();

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="interview-ai-theme">
        <SmoothScrollProvider>
          <ParticleEffect />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demo" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <Interview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-result/:id"
            element={
              <ProtectedRoute>
                <InterviewResult />
              </ProtectedRoute>
            }
          />
          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </SmoothScrollProvider>
  </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;