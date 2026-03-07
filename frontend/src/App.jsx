import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { HiringAuthProvider } from './context/HiringAuthContext';

// ──── Core pages ────
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
import NotFound from './pages/NotFound';

// ──── New Public SEO Pages ────
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';

// ──── Admin pages ────
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminBanks from './pages/AdminBanks';
import AdminPayments from './pages/AdminPayments';
import AdminHiringPayments from './pages/AdminHiringPayments';

// ──── Hiring Ease pages ────
import HiringEaseLanding from './pages/HiringEaseLanding';
import HiringLogin from './pages/HiringLogin';
import HiringRegister from './pages/HiringRegister';
import HiringPayment from './pages/HiringPayment';
import HiringDashboard from './pages/HiringDashboard';
import HiringBanks from './pages/HiringBanks';
import CreateHiringSession from './pages/CreateHiringSession';
import HiringSessionDetail from './pages/HiringSessionDetail';
import CandidateDetail from './pages/CandidateDetail';

// ──── Public candidate-facing pages ────
import CandidateEntry from './pages/CandidateEntry';
import CandidateInterview from './pages/CandidateInterview';
import CandidateComplete from './pages/CandidateComplete';
import HoverEffects from './components/HoverEffects';
import SeoManager from './components/SeoManager';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── New Public SEO Pages ── */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faq" element={<FAQ />} />


      {/* ── Protected Main Platform Routes ── */}
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/chatbot" element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />} />
      <Route path="/resume" element={isAuthenticated ? <Resume /> : <Navigate to="/login" />} />
      <Route path="/interview" element={isAuthenticated ? <InterviewPreparation /> : <Navigate to="/login" />} />
      <Route path="/interview/session/:sessionId" element={isAuthenticated ? <InterviewSession /> : <Navigate to="/login" />} />
      <Route path="/interview/result/:sessionId" element={isAuthenticated ? <InterviewResult /> : <Navigate to="/login" />} />

      {/* ── Account Routes ── */}
      <Route path="/change-username" element={isAuthenticated ? <ChangeUsername /> : <Navigate to="/login" />} />
      <Route path="/change-password" element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />} />
      <Route path="/subscription" element={isAuthenticated ? <SubscriptionPlan /> : <Navigate to="/login" />} />

      {/* ── Admin Routes ── */}
      <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={isAuthenticated ? <AdminUsers /> : <Navigate to="/login" />} />
      <Route path="/admin/banks" element={isAuthenticated ? <AdminBanks /> : <Navigate to="/login" />} />
      <Route path="/admin/payments" element={isAuthenticated ? <AdminPayments /> : <Navigate to="/login" />} />
      <Route path="/admin/hiring-payments" element={isAuthenticated ? <AdminHiringPayments /> : <Navigate to="/login" />} />

      {/* ── Hiring Ease: Auth Routes ── */}
      <Route path="/hiring-ease" element={isAuthenticated ? <HiringEaseLanding /> : <Navigate to="/login" />} />
      <Route path="/hiring-ease/login" element={<HiringLogin />} />
      <Route path="/hiring-ease/register" element={<HiringRegister />} />
      <Route path="/hiring-ease/payment" element={<HiringPayment />} />

      {/* ── Hiring Ease: Manager Dashboard Routes ── */}
      <Route path="/hiring-ease/dashboard" element={<HiringDashboard />} />
      <Route path="/hiring-ease/banks" element={<HiringBanks />} />
      <Route path="/hiring-ease/create-session" element={<CreateHiringSession />} />
      <Route path="/hiring-ease/session/:id" element={<HiringSessionDetail />} />
      <Route path="/hiring-ease/candidate/:id" element={<CandidateDetail />} />

      {/* ── Public candidate-facing routes (no login required) ── */}
      <Route path="/hire/:sessionId" element={<CandidateEntry />} />
      <Route path="/hire/:sessionId/interview/:candidateId" element={<CandidateInterview />} />
      <Route path="/hire/:sessionId/complete" element={<CandidateComplete />} />

      {/* ── Fallback ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HiringAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SeoManager />
            <HoverEffects />
            <div className="workspace">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </HiringAuthProvider>
    </AuthProvider>
  );
}