import React, { useState, useEffect } from 'react';
import { getFamilyByUserId, getFamilyMembers } from '../../lib/api';
import './FamilyArchiveSystem.css';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  birthday?: string;
  access_level: string;
}

interface FolderStructure {
  familyName: string;
  members: FamilyMember[];
}

const FamilyArchiveSystem: React.FC = () => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock current user - in real app this would come from auth
  const currentUserId = 1;

  useEffect(() => {
    loadFamilyStructure();
  }, []);

  const loadFamilyStructure = async () => {
    try {
      // Get family info
      const familyResult = await getFamilyByUserId(currentUserId);
      if (familyResult.success && familyResult.family) {
        // Get family members
        const membersResult = await getFamilyMembers(familyResult.family.id);
        if (membersResult.success && membersResult.members) {
          setFolderStructure({
            familyName: familyResult.family.family_name,
            members: membersResult.members
          });
        }
      }
    } catch (error) {
      console.error('Error loading family structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMemberContext = (member: FamilyMember): string => {
    const age = member.age ? ` (${member.age} years old)` : '';
    const birthday = member.birthday ? `\nBirthday: ${new Date(member.birthday).toLocaleDateString()}` : '';
    
    return `Family Member: ${member.name}${age}
Role: ${member.role}${birthday}
Access Level: ${member.access_level}
Created: ${new Date().toISOString()}

This file contains contextual information about ${member.name} for AI processing and family management within the MyAIM Central system.

Additional context can be added here as needed for personalized AI interactions and task management.`;
  };

  if (loading) {
    return <div className="archive-loading">Loading family archives...</div>;
  }

  if (!folderStructure) {
    return <div className="archive-error">No family found. Please set up your family first.</div>;
  }

  return (
    <div className="archive-system">
      <h2>Family Archives</h2>
      
      <div className="folder-structure">
        <div className="family-folder">
          <div className="folder-icon">📁</div>
          <div className="folder-name">{folderStructure.familyName}</div>
          
          <div className="member-folders">
            {folderStructure.members.map(member => (
              <div key={member.id} className="member-folder">
                <div 
                  className="folder-icon clickable"
                  onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                >
                  📂
                </div>
                <div className="folder-name">{member.name}</div>
                
                {selectedMember?.id === member.id && (
                  <div className="member-file">
                    <div className="file-icon">📄</div>
                    <div className="file-name">{member.name}_context.txt</div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Reference to external document */}
            <div className="external-file">
              <div className="file-icon">📄</div>
              <div className="file-name">AIM_Ecosystem.docx</div>
              <div className="file-path">C:\Users\tenis\Downloads\AIM Ecosystem.docx</div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedMember && (
        <div className="member-context">
          <h3>{selectedMember.name} - Context File</h3>
          <pre className="context-content">
            {generateMemberContext(selectedMember)}
          </pre>
          
          <div className="context-actions">
            <button onClick={() => {
              const content = generateMemberContext(selectedMember);
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${selectedMember.name}_context.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Download Context File
            </button>
          </div>
        </div>
      )}
      
      <div className="archive-info">
        <p>This archive system maintains contextual information about your family members for AI processing and personalized task management.</p>
        <p>Each family member has their own context file that can be used to provide personalized AI responses.</p>
      </div>
    </div>
  );
};

export default FamilyArchiveSystem;