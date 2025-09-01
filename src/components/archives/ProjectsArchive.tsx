import React from 'react';
import './ProjectsArchive.css';

const ProjectsArchive: React.FC = () => {
  return (
    <div className="projects-archive">
      <h2>AI Projects Archive</h2>
      <p className="coming-soon-message">
        This section will house special AI projects with context files, similar to projects in Claude or ChatGPT.
      </p>
      
      <div className="feature-preview">
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Project Contexts</h3>
          <p>Create specialized AI contexts for different projects and goals</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Knowledge Bases</h3>
          <p>Build custom knowledge bases for domain-specific AI assistance</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h3>Context Linking</h3>
          <p>Link family contexts with project contexts for personalized AI interactions</p>
        </div>
      </div>
      
      <div className="status-banner">
        <div className="status-icon">🚧</div>
        <div className="status-text">
          <h4>Coming Soon</h4>
          <p>AI Projects functionality is currently in development and will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsArchive;