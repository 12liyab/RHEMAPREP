import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckIn } from './components/CheckIn';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { loading } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const isAdmin = window.location.pathname === '/admin';
    setShowAdmin(isAdmin);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showAdmin) {
    return (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  return <CheckIn />;
}

function App() {
  useEffect(() => {
    const handlePopState = () => {
      // Handle route changes if needed
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider>
      <div onClick={(e) => {
        if ((e.target as HTMLElement).tagName === 'A') {
          const href = (e.target as HTMLAnchorElement).href;
          if (href.includes('/admin')) {
            window.history.pushState(null, '', '/admin');
          }
        }
      }}>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
