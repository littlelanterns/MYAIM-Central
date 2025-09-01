import React, { useState } from 'react';
import FamilyArchiveSystem from './FamilyArchiveSystem';
import ProjectsArchive from './ProjectsArchive';
import './YourArchives.css';

const YourArchives: React.FC = () => {
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);

  return (
    <div className="your-archives">
      <h1>Your Archives</h1>
      <p className="archives-description">
        Manage your family context and AI projects in organized archive folders.
      </p>
      
      <div className="archive-structure">
        {!selectedArchive ? (
          <div className="archive-folders">
            <div 
              className="archive-folder"
              onClick={() => setSelectedArchive('family')}
            >
              <div className="folder-icon">[Family]</div>
              <div className="folder-details">
                <h3>Family Archive</h3>
                <p>Family member context files and personal information for AI interactions</p>
              </div>
            </div>

            <div 
              className="archive-folder"
              onClick={() => setSelectedArchive('projects')}
            >
              <div className="folder-icon">[Projects]</div>
              <div className="folder-details">
                <h3>AI Projects</h3>
                <p>Special projects with context for personalized AI assistance (coming soon)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="archive-content">
            <div className="back-navigation">
              <button 
                className="back-btn"
                onClick={() => setSelectedArchive(null)}
              >
                ← Back to Your Archives
              </button>
            </div>

            {selectedArchive === 'family' && <FamilyArchiveSystem />}
            {selectedArchive === 'projects' && <ProjectsArchive />}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourArchives;