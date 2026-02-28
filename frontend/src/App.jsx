import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Import existing pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Resume from './pages/Resume';
import InterviewPreparation from './pages/InterviewPreparation';
import InterviewSession from './pages/InterviewSession';
import InterviewResult from './pages/InterviewResult';
import ChangeUsername from './pages/ChangeUsername';
import ChangePassword from './pages/ChangePassword';
import SubscriptionPlan from './pages/SubscriptionPlan';
import HiringEase from './pages/HiringEase';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBanks from './pages/AdminBanks';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* ✅ Added the Verify OTP route */}
      <Route path="/verify-otp" element={<VerifyOtp />} />
      
      {/* Note: You can remove /activate if you are strictly using OTP now.
         The backend verify-otp endpoint has replaced it.
      */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Main Platform Routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/chatbot"
        element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />}
      />
      <Route
        path="/resume"
        element={isAuthenticated ? <Resume /> : <Navigate to="/login" />}
      />
      <Route
        path="/interview"
        element={isAuthenticated ? <InterviewPreparation /> : <Navigate to="/login" />}
      />
      <Route
        path="/interview/session/:sessionId"
        element={isAuthenticated ? <InterviewSession /> : <Navigate to="/login" />}
      />
      <Route
        path="/interview/result/:sessionId"
        element={isAuthenticated ? <InterviewResult /> : <Navigate to="/login" />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin/users"
        element={isAuthenticated ? <AdminUsers /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin/banks"
        element={isAuthenticated ? <AdminBanks /> : <Navigate to="/login" />}
      />

      {/* Protected Account & Enterprise Routes */}
      <Route
        path="/change-username"
        element={isAuthenticated ? <ChangeUsername /> : <Navigate to="/login" />}
      />
      <Route
        path="/change-password"
        element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />}
      />
      <Route
        path="/subscription"
        element={isAuthenticated ? <SubscriptionPlan /> : <Navigate to="/login" />}
      />
      <Route
        path="/hiring-ease"
        element={isAuthenticated ? <HiringEase /> : <Navigate to="/login" />}
      />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="workspace">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}