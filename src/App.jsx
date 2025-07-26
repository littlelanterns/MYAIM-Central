// src/App.jsx - Corrected version with family-setup route added
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.tsx';
import CommandCenter from './pages/CommandCenter.tsx';
import FamilyDashboard from './pages/FamilyDashboard.tsx';
import TeenDashboard from './pages/TeenDashboard.tsx';
import FamilyArchive from './pages/FamilyArchive.tsx';
import Library from './pages/Library.tsx';
import Login from './pages/Login.tsx';
import FamilySetupInterface from './pages/FamilySettings.tsx'; // Import the new component
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<CommandCenter />} />
            <Route path="command-center" element={<CommandCenter />} />
            <Route path="family-dashboard" element={<FamilyDashboard />} />
            <Route path="teen-dashboard" element={<TeenDashboard />} />
            <Route path="family-archive" element={<FamilyArchive />} />
            <Route path="library" element={<Library />} />
            <Route path="family-setup" element={<FamilySetupInterface />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;