// src/App.jsx - Corrected version with ModalProvider and family-setup route added
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import CommandCenter from './pages/CommandCenter.tsx';
import FamilyDashboard from './pages/FamilyDashboard.tsx';
import TeenDashboard from './pages/TeenDashboard.tsx';
import ChildDashboard from './pages/ChildDashboard.tsx';
import FamilyArchive from './pages/FamilyArchive.tsx';
import YourArchivesPage from './pages/YourArchives.tsx';
import Library from './pages/Library.tsx';
import Login from './pages/Login.tsx';
import FamilySetupInterface from './pages/FamilySettings.tsx'; // Import the new component
import './styles/global.css';

function App() {
  return (
    <ModalProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
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
              <Route path="family-setup" element={<FamilySetupInterface />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ModalProvider>
  );
}

export default App;