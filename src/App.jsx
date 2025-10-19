// src/App.jsx - Corrected version with ModalProvider and family-setup route added
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext.tsx';
import { FeedbackProvider } from './contexts/FeedbackContext.jsx';
import { AuthProvider } from './components/auth/shared/AuthContext.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import CommandCenter from './pages/CommandCenter.tsx';
import FamilyDashboard from './pages/FamilyDashboard.tsx';
import TeenDashboard from './pages/TeenDashboard.tsx';
import ChildDashboard from './pages/ChildDashboard.tsx';
import FamilyArchive from './pages/FamilyArchive.tsx';
import YourArchivesPage from './pages/YourArchives.tsx';
import Library from './pages/Library.jsx';
import LibraryAdmin from './components/Admin/LibraryAdmin.jsx';
import BetaAdmin from './components/Admin/BetaAdmin.jsx';
import AimAdminDashboard from './components/Admin/AimAdminDashboard.jsx';
import NormalMomLogin from './pages/NormalMomLogin.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import FamilyMemberLogin from './pages/FamilyMemberLogin.tsx';
import FamilySetupInterface from './pages/FamilySettings.tsx';
import BetaLogin from './components/auth/BetaLogin.jsx';
import ForcedFamilySetup from './components/auth/ForcedFamilySetup.jsx';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <FeedbackProvider>
          <Router>
            <div className="App">
            <Routes>
              {/* Login Routes - 3 Different Entry Points */}
              <Route path="/login" element={<NormalMomLogin />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/dashboard" element={<FamilyMemberLogin />} />

              {/* Beta Routes */}
              <Route path="/beta/login" element={<BetaLogin />} />
              <Route path="/beta/family-setup" element={<ForcedFamilySetup />} />
              
              {/* Standalone Dashboards - No MainLayout */}
              <Route path="/teen-dashboard" element={<TeenDashboard />} />
              <Route path="/child-dashboard" element={<ChildDashboard />} />
              
              {/* Main App Routes - With MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<CommandCenter />} />
                <Route path="command-center" element={<CommandCenter />} />
                <Route path="family-dashboard" element={<FamilyDashboard />} />
                <Route path="family-archive" element={<FamilyArchive />} />
                <Route path="your-archives" element={<YourArchivesPage />} />
                <Route path="library" element={<Library />} />
                <Route path="library/admin" element={<LibraryAdmin />} />
                <Route path="beta/admin" element={<BetaAdmin />} />
                <Route path="aim-admin" element={<AimAdminDashboard />} />
                <Route path="family-setup" element={<FamilySetupInterface />} />
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