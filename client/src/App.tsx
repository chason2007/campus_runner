import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import RunnerDashboard from './pages/RunnerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProfileSettings from './pages/ProfileSettings';
import GroupOrderView from './pages/GroupOrderView';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import Cursor from './components/Cursor';
import './campus-runner.css';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#080808' }).catch(() => {});

      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          CapacitorApp.exitApp();
        }
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, [navigate]);

  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <I18nProvider>
            <Cursor />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/runner"
                element={
                  <ProtectedRoute allowedRoles={['runner']}>
                    <RunnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/group/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <GroupOrderView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'runner', 'vendor', 'admin']}>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </I18nProvider>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
