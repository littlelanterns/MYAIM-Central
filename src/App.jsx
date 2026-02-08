// src/App.jsx - Corrected version with ModalProvider and family-setup route added
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext.tsx';
import { FeedbackProvider } from './contexts/FeedbackContext.jsx';
import { AuthProvider } from './components/auth/shared/AuthContext.tsx';
import { checkSessionValidity } from './lib/sessionManager';
import MainLayout from './layouts/MainLayout.tsx';
import MarketingLayout from './layouts/MarketingLayout.tsx';
import CommandCenter from './pages/CommandCenter.tsx';
import FamilyDashboard from './pages/FamilyDashboard.tsx';
// Removed - use play/guided/independent modes instead
// import TeenDashboard from './pages/TeenDashboard.tsx';
// import ChildDashboard from './pages/ChildDashboard.tsx';
import Archives from './pages/Archives.tsx';
import PromptLibrary from './pages/PromptLibrary.tsx';
import YourArchivesPage from './pages/YourArchives.tsx';
import Library from './pages/Library.jsx';
import InnerOracle from './pages/InnerOracle.jsx';
import MindSweep from './pages/MindSweep.jsx';
import LibraryAdmin from './components/Admin/LibraryAdmin.jsx';
import BetaAdmin from './components/Admin/BetaAdmin.jsx';
import AimAdminDashboard from './components/Admin/AimAdminDashboard.jsx';
import NormalMomLogin from './pages/NormalMomLogin.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import FamilyMemberLogin from './pages/FamilyMemberLogin.tsx';
import FamilySetupInterface from './pages/FamilySettings.tsx';
import BetaLogin from './components/auth/BetaLogin.jsx';
import ForcedFamilySetup from './components/auth/ForcedFamilySetup.jsx';
import PersonalDashboard from './components/dashboard/personal/PersonalDashboard.tsx';
import MemberDashboard from './pages/MemberDashboard.tsx';
import StandaloneMemberDashboard from './pages/StandaloneMemberDashboard.tsx';
import AdditionalAdultDashboardWrapper from './components/dashboard/additional-adult/AdditionalAdultDashboardWrapper.tsx';
import DashboardPreview from './pages/DashboardPreview.tsx';
import Home from './pages/marketing/Home.tsx';
import Pricing from './pages/marketing/Pricing.tsx';
import About from './pages/marketing/About.tsx';
import BetaSignup from './pages/marketing/BetaSignup.tsx';
import Articles from './pages/marketing/Articles.tsx';
import ArticleDetail from './pages/marketing/ArticleDetail.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import AccountSettings from './pages/AccountSettings.tsx';
import './styles/global.css';

function App() {
  // Check session validity on app load (handles "Remember Me" logic)
  // Skip if we're on the login page to avoid interference
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/login' || currentPath === '/dashboard' || currentPath === '/';

    if (!isLoginPage) {
      checkSessionValidity();
    }
  }, []);

  return (
    <AuthProvider>
      <ModalProvider>
        <FeedbackProvider>
          <Router>
            <div className="App">
            <Routes>
              {/* Marketing Site Routes (Public) */}
              <Route path="/" element={<MarketingLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="articles" element={<Articles />} />
                <Route path="articles/:slug" element={<ArticleDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="beta-signup" element={<BetaSignup />} />
              </Route>

              {/* Login Routes - 3 Different Entry Points */}
              <Route path="/login" element={<NormalMomLogin />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/dashboard" element={<FamilyMemberLogin />} />

              {/* Password Reset Routes */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Auth Callback - handles email confirmation redirects */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Settings Routes - Standalone pages */}
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/family-settings" element={<FamilySetupInterface />} />

              {/* Beta Routes */}
              <Route path="/beta/login" element={<BetaLogin />} />
              <Route path="/beta/family-setup" element={<ForcedFamilySetup />} />

              {/* Dashboard Preview - Standalone */}
              <Route path="/dashboard-preview" element={<DashboardPreview />} />

              {/* Standalone Family Member Dashboard - for PIN-logged family members */}
              {/* NOT under /commandcenter - no access to mom-only features */}
              <Route path="/family-dashboard/:memberId" element={<StandaloneMemberDashboard />} />

              {/* Standalone Dashboards - No MainLayout */}
              {/* Use play/guided/independent modes instead */}
              {/* <Route path="/teen-dashboard" element={<TeenDashboard />} /> */}
              {/* <Route path="/child-dashboard" element={<ChildDashboard />} /> */}
              
              {/* Main App Routes - With MainLayout */}
              <Route path="/commandcenter" element={<MainLayout />}>
                <Route index element={<CommandCenter />} />
                <Route path="command-center" element={<CommandCenter />} />
                <Route path="family-dashboard" element={<FamilyDashboard />} />
                <Route path="dashboard/personal" element={<PersonalDashboard />} />
                <Route path="member/:memberId" element={<MemberDashboard />} />
                <Route path="dashboard/additional-adult" element={<AdditionalAdultDashboardWrapper />} />
                <Route path="family-archive" element={<Archives />} />
                <Route path="archives" element={<Archives />} />
                <Route path="prompt-library" element={<PromptLibrary />} />
                <Route path="your-archives" element={<YourArchivesPage />} />
                <Route path="library" element={<Library />} />
                <Route path="library/admin" element={<LibraryAdmin />} />
                <Route path="beta/admin" element={<BetaAdmin />} />
                <Route path="aim-admin" element={<AimAdminDashboard />} />
                <Route path="family-setup" element={<FamilySetupInterface />} />
                <Route path="inner-oracle" element={<InnerOracle />} />
                <Route path="mindsweep" element={<MindSweep />} />
              </Route>
            </Routes>
            </div>
          </Router>
        </FeedbackProvider>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;