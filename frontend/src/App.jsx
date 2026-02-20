import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import existing pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
// ✅ Import your new VerifyOtp page
import VerifyOtp from './pages/VerifyOtp'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Resume from './pages/Resume';
import InterviewPreparation from './pages/InterviewPreparation';

// Import missing account and enterprise pages
import ChangeUsername from './pages/ChangeUsername';
import ChangePassword from './pages/ChangePassword';
import SubscriptionPlan from './pages/SubscriptionPlan';
import HiringEase from './pages/HiringEase';

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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}