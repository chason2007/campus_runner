import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import BuyerDashboard from './pages/BuyerDashboard';
import RunnerDashboard from './pages/RunnerDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/" />;
  // If we have token but react state is lost on refresh, usually we'd fetch user. 
  // For MVP if user is missing but token exists, we'll let it pass or redirect to login.
  if (user && allowedRole && user.role !== allowedRole) return <Navigate to="/" />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRole="Buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/runner"
        element={
          <ProtectedRoute allowedRole="Runner">
            <RunnerDashboard />
          </ProtectedRoute>
        }
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
