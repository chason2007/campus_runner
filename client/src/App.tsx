import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from './components/PageWrapper';
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
import ErrorBoundary from './components/ErrorBoundary';
import './campus-runner.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <I18nProvider>
              <Cursor />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
                  <Route
                    path="/student"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PageWrapper><StudentDashboard /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/runner"
                    element={
                      <ProtectedRoute allowedRoles={['runner']}>
                        <PageWrapper><RunnerDashboard /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor"
                    element={
                      <ProtectedRoute allowedRoles={['vendor']}>
                        <PageWrapper><VendorDashboard /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <PageWrapper><AdminDashboard /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/group/:id"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <PageWrapper><GroupOrderView /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'runner', 'vendor', 'admin']}>
                        <PageWrapper><ProfileSettings /></PageWrapper>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </I18nProvider>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
