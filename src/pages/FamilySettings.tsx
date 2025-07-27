// src/pages/FamilySettings.tsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { X, Edit2, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  saveFamilySetup, 
  saveFamilyMember, 
  getFamilyMembers, 
  getFamilyByUserId,
  deleteFamilyMember 
} from '../lib/api.js';
import { processFamilyDescription } from '../lib/aiServices.js';

// TypeScript Interfaces
interface RelationshipType {
  label: string;
  color: string;
  examples?: string[];
}

interface AccessLevel {
  label: string;
  description: string;
  tooltip: string;
}

interface FamilyMember {
  id: string | number;
  name: string;
  nicknames: string[];
  birthday: string;
  relationship: string;
  customRole: string;
  accessLevel: string;
  inHousehold: boolean;
  permissions: Record<string, boolean>;
  notes: string;
  family_id?: string;
}

interface ShowPermissionsState {
  [key: string]: boolean;
}

interface CollapsedState {
  [key: string]: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface AIProcessedMember {
  id: string | number;
  name: string;
  relationship: string;
  accessLevel: string;
  age?: number;
  birthday?: string;
  nicknames: string[];
  notes: string;
  selected: boolean;
  permissionTemplate?: string;
}

const FamilySetupInterface: React.FC = () => {
  const [familyName, setFamilyName] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showPermissions, setShowPermissions] = useState<ShowPermissionsState>({});
  const [collapsed, setCollapsed] = useState<CollapsedState>({});
  const [showBulkAdd, setShowBulkAdd] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [aiProcessing, setAiProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  
  // AI Verification states
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [aiProcessedMembers, setAiProcessedMembers] = useState<AIProcessedMember[]>([]);
  const [aiOriginalText, setAiOriginalText] = useState<string>('');
  const [expandedMembers, setExpandedMembers] = useState<{[key: string]: boolean}>({});
  
  // Draggable functionality
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUserId: number = 1;

  // FIXED: Updated relationship types - "Adult Child" → "Out of Nest"
  const relationshipTypes: Record<string, RelationshipType> = {
    self: { label: 'Self (Me)', color: 'var(--accent-tertiary, #805a82)' },
    child: { label: 'Child', color: 'var(--primary-color, #68a395)' },
    'out-of-nest': { 
      label: 'Out of Nest', 
      color: 'var(--secondary-color, #d6a461)',
      examples: ['Grown children who moved out', 'Adult children with families', 'College-age kids', 'Grandchildren', 'Married children', 'Children-in-law', 'Great-grandchildren', 'Extended family descendants']
    },
    partner: { label: 'Partner/Spouse', color: 'var(--accent-secondary, #b25a58)' },
    special: { 
      label: 'Special Role', 
      color: 'var(--accent-tertiary, #805a82)',
      examples: ['Grandparent', 'Caregiver', 'Tutor', 'Babysitter', 'Family Friend', 'Aunt/Uncle', 'Cousin', 'Other relatives']
    }
  };

  const accessLevels: Record<string, AccessLevel> = {
    guided: { 
      label: 'Guided', 
      description: 'Simple, visual interface with big buttons and pictures',
      tooltip: 'Great for children or users who prefer visual cues and simplified navigation'
    },
    independent: { 
      label: 'Independent', 
      description: 'Standard interface for self-managing',
      tooltip: 'Perfect for users familiar with technology, older children, or teens who can manage themselves'
    },
    full: { 
      label: 'Full Access', 
      description: 'Complete dashboard with all features',
      tooltip: 'Reserved for parents and primary caregivers who need complete family management control'
    },
    none: {
      label: 'No Access',
      description: 'Context-only member, no dashboard access',
      tooltip: 'For family members who provide context but do not use the app'
    }
  };

  const permissions: Record<string, string> = {
    'view-family-calendar': 'View family calendar and schedules',
    'edit-family-calendar': 'Add/edit family calendar events',
    'create-tasks': 'Create and assign tasks to others',
    'edit-all-tasks': 'Edit anyone\'s tasks (not just their own)',
    'delete-tasks': 'Delete tasks created by others',
    'edit-family-info': 'Edit family member information and settings',
    'manage-family-members': 'Add/remove family members',
    'view-finances': 'See point values and financial rewards',
    'manage-finances': 'Change point values and reward amounts',
    'family-settings': 'Change household rules and app settings',
    'view-private-notes': 'See private family notes and context',
    'edit-private-notes': 'Add/edit private family notes',
    'manage-integrations': 'Connect/disconnect external services',
    'view-usage-analytics': 'See family app usage and statistics'
  };

  const permissionTemplates = {
    'full-admin': {
      name: 'Full Administrator',
      description: 'Complete control over everything (you!)',
      permissions: Object.keys(permissions)
    },
    'partner-collaborative': {
      name: 'Collaborative Partner',
      description: 'Can manage day-to-day but not core settings',
      permissions: [
        'view-family-calendar', 'edit-family-calendar', 'create-tasks', 'edit-all-tasks',
        'view-finances', 'view-private-notes', 'edit-private-notes', 'view-usage-analytics'
      ]
    },
    'partner-limited': {
      name: 'Limited Partner',
      description: 'Can view and manage their own stuff only',
      permissions: [
        'view-family-calendar', 'edit-family-calendar', 'create-tasks',
        'view-finances', 'view-private-notes'
      ]
    },
    'teen-manager': {
      name: 'Teen with Responsibilities',
      description: 'Can help manage younger siblings',
      permissions: [
        'view-family-calendar', 'create-tasks', 'view-finances'
      ]
    },
    'view-only': {
      name: 'View Only',
      description: 'Can see everything but not change anything',
      permissions: [
        'view-family-calendar', 'view-finances', 'view-private-notes', 'view-usage-analytics'
      ]
    }
  };

  // All the handler functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragState.isDragging && modalRef.current) {
      const newX = e.clientX - dragState.offsetX;
      const newY = e.clientY - dragState.offsetY;
      
      modalRef.current.style.left = `${newX}px`;
      modalRef.current.style.top = `${newY}px`;
      modalRef.current.style.transform = 'none';
    }
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging]);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const familyResult = await getFamilyByUserId(currentUserId);
      if (familyResult.success && familyResult.family) {
        setFamilyName(familyResult.family.family_name || '');
        setCurrentFamilyId(familyResult.family.id);
        
        const membersResult = await getFamilyMembers(familyResult.family.id);
        if (membersResult.success && membersResult.members) {
          const formattedMembers: FamilyMember[] = membersResult.members.map((member: any) => ({
            id: member.id,
            name: member.name,
            nicknames: member.nicknames || [''],
            birthday: member.birthday || '',
            relationship: member.role === 'adult-child' ? 'out-of-nest' : member.role, // Convert old data
            customRole: member.role === 'special' ? member.role : '',
            accessLevel: member.access_level || 'guided',
            inHousehold: member.in_household !== false,
            permissions: member.permissions || {},
            notes: member.notes || ''
          }));
          setFamilyMembers(formattedMembers);
          
          const collapsedState: CollapsedState = {};
          formattedMembers.forEach(member => {
            collapsedState[member.id] = true;
          });
          setCollapsed(collapsedState);
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Auto-detect "Self" for first member
  const addFamilyMember = (): void => {
    const isFirstMember = familyMembers.length === 0;
    const newMember: FamilyMember = {
      id: Date.now(),
      name: '',
      nicknames: [''],
      birthday: '',
      relationship: isFirstMember ? 'self' : 'child',
      customRole: '',
      accessLevel: isFirstMember ? 'full' : 'guided',
      inHousehold: true,
      permissions: isFirstMember ? Object.keys(permissions).reduce((acc, perm) => ({...acc, [perm]: true}), {}) : {},
      notes: ''
    };
    setFamilyMembers([...familyMembers, newMember]);
    setCollapsed({...collapsed, [newMember.id]: false}); // Auto-expand for editing
  };

  const updateMember = (id: string | number, field: keyof FamilyMember, value: any): void => {
    setFamilyMembers(members => 
      members.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const saveMember = async (memberId: string | number): Promise<void> => {
    try {
      setSaving(true);
      const memberData = familyMembers.find(m => m.id === memberId);
      
      if (!memberData) {
        alert('Member data not found');
        return;
      }

      if (!currentFamilyId) {
        const familyResult = await saveFamilySetup({
          wordpress_user_id: currentUserId,
          family_name: familyName || 'My Family'
        });
        
        if (!familyResult.success) {
          alert('Error saving family: ' + familyResult.error);
          return;
        }
        setCurrentFamilyId(familyResult.familyId);
        memberData.family_id = familyResult.familyId;
      } else {
        memberData.family_id = currentFamilyId;
      }

      const result = await saveFamilyMember(memberData);
      
      if (result.success) {
        setFamilyMembers(members => 
          members.map(member => 
            member.id === memberId ? { ...member, id: result.member.id } : member
          )
        );
        setCollapsed({ ...collapsed, [result.member.id]: true });
        alert('Member saved successfully!');
      } else {
        alert('Error saving member: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const editMember = (memberId: string | number): void => {
    setCollapsed({ ...collapsed, [memberId]: false });
  };

  const handleBulkAdd = async (): Promise<void> => {
    if (!bulkText.trim()) {
      alert('Please enter a description of your family members');
      return;
    }

    try {
      setAiProcessing(true);
      
      const result = await processFamilyDescription(bulkText, familyMembers);
      
      if (!result.success) {
        alert('AI Processing Error: ' + result.error);
        return;
      }

      if (result.newMembers.length === 0) {
        alert('No new family members found to add. They might already exist in your family.');
        return;
      }

const processedMembers: AIProcessedMember[] = result.newMembers.map(member => {
  // FIXED: Auto-apply smart permission defaults without showing "Auto-detect" option
  let defaultTemplate: string | undefined = undefined;
  if (member.relationship === 'partner') {
    defaultTemplate = 'partner-limited';
  } else if (member.relationship === 'self') {
    defaultTemplate = 'full-admin';
  }

        return {
          id: member.id,
          name: member.name,
          relationship: member.relationship === 'adult-child' ? 'out-of-nest' : member.relationship, // Convert
          accessLevel: member.accessLevel,
          age: member.notes.includes('Age') ? parseInt(member.notes.match(/Age (\d+)/)?.[1] || '0') || undefined : undefined,
          nicknames: member.nicknames || [], // FIXED: Ensure nicknames array
          birthday: '', // FIXED: Initialize birthday field
          notes: member.notes,
          selected: true,
          permissionTemplate: defaultTemplate // FIXED: Auto-apply smart defaults
        };
      });

      setAiProcessedMembers(processedMembers);
      setAiOriginalText(bulkText);
      setShowVerification(true);
      setShowBulkAdd(false);

    } catch (error) {
      console.error('Bulk add error:', error);
      alert('Something went wrong with AI processing: ' + error.message);
    } finally {
      setAiProcessing(false);
    }
  };

  const toggleMemberSelection = (memberId: string | number): void => {
    setAiProcessedMembers(members =>
      members.map(member =>
        member.id === memberId ? { ...member, selected: !member.selected } : member
      )
    );
  };

  const toggleMemberExpansion = (memberId: string | number): void => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const updateProcessedMember = (memberId: string | number, field: keyof AIProcessedMember, value: any): void => {
    setAiProcessedMembers(members =>
      members.map(member =>
        member.id === memberId ? { ...member, [field]: value } : member
      )
    );
  };

  const confirmAIMembers = (): void => {
    const selectedMembers = aiProcessedMembers.filter(member => member.selected);
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one family member to add.');
      return;
    }

    const newFamilyMembers: FamilyMember[] = selectedMembers.map(member => {
      // FIXED: Out of Nest and Special Role are always context-only
      let inHousehold = true;
      let accessLevel = member.accessLevel;
      
      if (member.relationship === 'out-of-nest' || member.relationship === 'special') {
        inHousehold = false;
        accessLevel = 'none';
      }
      
      // Apply permission template if specified
      let permissions: Record<string, boolean> = {};
      
      // First check if we have granular permissions stored in notes
      const notesPermsMatch = member.notes?.match(/Permissions: ({.*?})/);
      if (notesPermsMatch) {
        try {
          permissions = JSON.parse(notesPermsMatch[1]);
          // Clean permissions from notes
          const cleanNotes = member.notes.replace(/Permissions:.*?(?=\n|$)/s, '').trim();
          member.notes = cleanNotes;
        } catch (e) {
          // If parsing fails, fall back to template logic
          console.warn('Failed to parse permissions from notes:', e);
        }
      }
      
      // If no granular permissions were set, apply template logic
      if (Object.keys(permissions).length === 0 && inHousehold) {
        if (member.permissionTemplate && member.permissionTemplate !== 'auto') {
          // Apply selected template
          const template = permissionTemplates[member.permissionTemplate];
          if (template) {
            template.permissions.forEach(perm => {
              permissions[perm] = true;
            });
          }
        } else {
          // Smart defaults based on relationship
          if (member.relationship === 'partner') {
            // Default partners to "Limited Partner" instead of full access
            const template = permissionTemplates['partner-limited'];
            template.permissions.forEach(perm => {
              permissions[perm] = true;
            });
          } else if (member.relationship === 'child') {
            // Kids get basic permissions
            permissions['view-family-calendar'] = true;
            permissions['view-finances'] = true;
          }
        }
      }
      
      return {
        id: member.id,
        name: member.name,
        nicknames: member.nicknames || [], // FIXED: Use actual nicknames field
        birthday: member.birthday || '', // FIXED: Use actual birthday field
        relationship: member.relationship,
        customRole: member.relationship === 'special' ? member.name : '',
        accessLevel: accessLevel,
        inHousehold: inHousehold,
        permissions: permissions,
        notes: member.notes || '' // FIXED: Clean notes without birthday/nickname data
      };
    });

    setFamilyMembers([...familyMembers, ...newFamilyMembers]);
    
    setShowVerification(false);
    setAiProcessedMembers([]);
    setBulkText('');
    
    const names = selectedMembers.map(m => m.name).join(', ');
    const permissionInfo = selectedMembers.some(m => m.permissionTemplate && m.permissionTemplate !== 'auto') 
      ? '\n\nCustom permissions have been applied! You can further customize them by editing each member.'
      : '\n\nSmart permission defaults have been applied based on relationships.';
    
    alert(`Added ${selectedMembers.length} family members: ${names}${permissionInfo}`);
  };

  const retryAIProcessing = (): void => {
    setShowVerification(false);
    setShowBulkAdd(true);
    setBulkText(aiOriginalText);
  };

  const togglePermission = (memberId: string | number, permission: string): void => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member) {
      const newPermissions = { 
        ...member.permissions, 
        [permission]: !member.permissions[permission] 
      };
      updateMember(memberId, 'permissions', newPermissions);
    }
  };

  const removeMember = async (id: string | number): Promise<void> => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      if (typeof id === 'string' && id.includes('-')) {
        try {
          const result = await deleteFamilyMember(id);
          if (!result.success) {
            alert('Error removing member: ' + result.error);
            return;
          }
        } catch (error) {
          console.error('Error removing member:', error);
          alert('Error removing member: ' + (error as Error).message);
          return;
        }
      }
      
      setFamilyMembers(members => members.filter(member => member.id !== id));
    }
  };

  const handleSaveFamilySetup = async (): Promise<void> => {
    try {
      setSaving(true);
      
      const familyResult = await saveFamilySetup({
        wordpress_user_id: currentUserId,
        family_name: familyName || 'My Family'
      });
      
      if (!familyResult.success) {
        alert('Error saving family: ' + familyResult.error);
        return;
      }
      
      setCurrentFamilyId(familyResult.familyId);

      const unsavedMembers = familyMembers.filter(member => 
        typeof member.id === 'number' || !String(member.id).includes('-')
      );
      
      for (const member of unsavedMembers) {
        member.family_id = familyResult.familyId;
        const result = await saveFamilyMember(member);
        if (!result.success) {
          alert('Error saving member ' + member.name + ': ' + result.error);
          return;
        }
      }

      alert('Family setup saved successfully!');
      await loadFamilyData();
      
    } catch (error) {
      console.error('Error saving family setup:', error);
      alert('Error saving family setup: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleFamilyNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFamilyName(e.target.value);
  };

  const handleBulkTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setBulkText(e.target.value);
  };

  const handleClose = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--primary-color, #68a395)' }}>
          <h2>Loading your family data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div 
        ref={modalRef}
        className="modal-content"
        style={{
          cursor: dragState.isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div 
          onMouseDown={handleMouseDown}
          className="modal-header"
          style={{
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              fontFamily: 'var(--font-heading, "The Seasons"), "Playfair Display", serif'
            }}>
              {currentFamilyId ? 'Update Your Family' : 'Getting to Know Your Family'}
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              {currentFamilyId ? 
                'Edit your family information and member details' : 
                'Tell us about your family so we can create the perfect experience for everyone'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          padding: '2rem',
          maxHeight: 'calc(90vh - 120px)',
          overflow: 'auto'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--primary-color, #68a395)',
              marginBottom: '0.5rem'
            }}>
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={handleFamilyNameChange}
              placeholder="The Smith Family"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                color: 'var(--primary-color, #68a395)',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0
              }}>
                Family Members
              </h2>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={addFamilyMember}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '1rem'
                }}
              >
                Add Family Member
              </button>
              
              <button
                onClick={() => setShowBulkAdd(true)}
                className="btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '1rem'
                }}
              >
                Bulk Add with AI
              </button>
            </div>

            {familyMembers.map((member) => (
              <div key={member.id} className="family-member-card">
                {collapsed[member.id] ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{member.name || 'Unnamed Family Member'}</strong>
                      {member.customRole && <span style={{ opacity: 0.7 }}>({member.customRole})</span>}
                      {!member.customRole && <span style={{ opacity: 0.7 }}>({relationshipTypes[member.relationship]?.label})</span>}
                      
                      <span className={`status-badge ${member.inHousehold ? 'household' : 'context-only'}`}>
                        {member.inHousehold ? 'Household' : 'Context Only'}
                      </span>
                      
                      {member.inHousehold && (
                        <span className="status-badge access-level">
                          {accessLevels[member.accessLevel]?.label || member.accessLevel}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => editMember(member.id)}
                        className="btn-primary"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeMember(member.id)}
                        style={{
                          background: 'var(--accent-secondary, #b25a58)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => saveMember(member.id)}
                      disabled={saving}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'var(--primary-color, #68a395)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        opacity: saving ? 0.7 : 1
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                        placeholder="Full name"
                        style={{
                          width: '100%',
                          padding: '0.75rem'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Relationship</label>
                      <select
                        value={member.relationship}
                        onChange={(e) => updateMember(member.id, 'relationship', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem'
                        }}
                      >
                        {Object.entries(relationshipTypes).map(([key, type]) => (
                          <option key={key} value={key}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {member.relationship === 'special' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Specify Role
                        </label>
                        <input
                          type="text"
                          value={member.customRole}
                          onChange={(e) => updateMember(member.id, 'customRole', e.target.value)}
                          placeholder="e.g., Grandparent, Babysitter, Tutor, Family Friend"
                          style={{
                            width: '100%',
                            padding: '0.75rem'
                          }}
                        />
                        <div className="info-box" style={{ marginTop: '0.5rem' }}>
                          Common roles: {relationshipTypes.special.examples?.join(', ')}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Household Status
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`household-${member.id}`}
                            checked={member.inHousehold === true}
                            onChange={() => {
                              updateMember(member.id, 'inHousehold', true);
                              if (member.relationship === 'child' && !member.accessLevel) {
                                updateMember(member.id, 'accessLevel', 'guided');
                              } else if (member.relationship === 'partner' && !member.accessLevel) {
                                updateMember(member.id, 'accessLevel', 'full');
                              }
                            }}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>
                            <strong>Lives in household</strong> - Gets dashboard access, can receive tasks
                          </span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`household-${member.id}`}
                            checked={member.inHousehold === false}
                            onChange={() => {
                              updateMember(member.id, 'inHousehold', false);
                              updateMember(member.id, 'accessLevel', 'none');
                            }}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span>
                            <strong>Context only</strong> - No dashboard, just for AI context & birthdays
                          </span>
                        </label>
                      </div>
                      <div className="info-box tip" style={{ marginTop: '0.5rem' }}>
                        <strong>Context-only members</strong> help AI understand your family dynamics but don't get app access. Perfect for adult children, distant relatives, or anyone you want to track for birthdays/context.
                      </div>
                    </div>

                    {member.inHousehold && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Access Level</label>
                        <select
                          value={member.accessLevel}
                          onChange={(e) => updateMember(member.id, 'accessLevel', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem'
                          }}
                        >
                          {Object.entries(accessLevels).filter(([key]) => key !== 'none').map(([key, level]) => (
                            <option key={key} value={key}>{level.label} - {level.description}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Birthday {!member.inHousehold && <span style={{ opacity: 0.7 }}>(for AI context & reminders)</span>}
                      </label>
                      <input
                        type="date"
                        value={member.birthday}
                        onChange={(e) => updateMember(member.id, 'birthday', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Notes {!member.inHousehold && <span style={{ opacity: 0.7 }}>(helps AI understand context)</span>}
                      </label>
                      <textarea
                        value={member.notes}
                        onChange={(e) => updateMember(member.id, 'notes', e.target.value)}
                        placeholder={member.inHousehold 
                          ? "Any special notes about this family member..." 
                          : "e.g., Lives in Chicago, visits monthly, loves soccer, studying medicine..."
                        }
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {member.inHousehold && (member.accessLevel === 'independent' || member.accessLevel === 'full') && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label style={{ fontWeight: '600' }}>
                            Specific Permissions
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPermissions({ ...showPermissions, [member.id]: !showPermissions[member.id] })}
                            style={{
                              background: 'var(--secondary-color, #d6a461)',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            {showPermissions[member.id] ? 'Hide Details' : 'Customize Permissions'}
                          </button>
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                            Quick Setup Templates:
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {Object.entries(permissionTemplates).map(([key, template]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  const newPermissions: Record<string, boolean> = {};
                                  template.permissions.forEach(perm => {
                                    newPermissions[perm] = true;
                                  });
                                  updateMember(member.id, 'permissions', newPermissions);
                                }}
                                className="template-btn"
                                title={template.description}
                              >
                                {template.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {showPermissions[member.id] && (
                          <div className="permission-section thin-scrollbar" style={{
                            maxHeight: '300px',
                            overflowY: 'auto'
                          }}>
                            <div className="info-box" style={{ marginBottom: '0.5rem' }}>
                              Uncheck permissions you don't want this person to have. Perfect for "I love you but don't touch my system" scenarios!
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="permission-group">
                                <h5>Calendar</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {['view-family-calendar', 'edit-family-calendar'].map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={member.permissions[permission] || false}
                                        onChange={() => togglePermission(member.id, permission)}
                                      />
                                      {permissions[permission]}
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="permission-group">
                                <h5>Tasks</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {['create-tasks', 'edit-all-tasks', 'delete-tasks'].map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={member.permissions[permission] || false}
                                        onChange={() => togglePermission(member.id, permission)}
                                      />
                                      {permissions[permission]}
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="permission-group">
                                <h5>Family Management</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {['edit-family-info', 'manage-family-members', 'family-settings'].map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={member.permissions[permission] || false}
                                        onChange={() => togglePermission(member.id, permission)}
                                      />
                                      {permissions[permission]}
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="permission-group">
                                <h5>Financial & Rewards</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {['view-finances', 'manage-finances'].map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={member.permissions[permission] || false}
                                        onChange={() => togglePermission(member.id, permission)}
                                      />
                                      {permissions[permission]}
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="permission-group">
                                <h5>Privacy & Data</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {['view-private-notes', 'edit-private-notes', 'manage-integrations', 'view-usage-analytics'].map(permission => (
                                    <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={member.permissions[permission] || false}
                                        onChange={() => togglePermission(member.id, permission)}
                                      />
                                      {permissions[permission]}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {familyMembers.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-color, #5a4033)',
                opacity: 0.6
              }}>
                <p>Click "Add Family Member" or "Bulk Add with AI" to get started!</p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSaveFamilySetup}
              disabled={saving}
              className="btn-primary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save My Family Setup'}
            </button>
          </div>
        </div>

        {/* FIXED: Bulk Add Modal - NO EMOJIS */}
        {showBulkAdd && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div 
              className="modal-content thin-scrollbar"
              style={{
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh'
              }}
            >
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  Bulk Add Family Members with AI
                </h3>
                <button
                  onClick={() => setShowBulkAdd(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-color, #5a4033)', marginBottom: '1rem' }}>
                  Just describe your family in natural language! Our AI will organize it automatically.
                </p>
                
                <div className="info-box" style={{ marginBottom: '1rem' }}>
                  <strong>Examples that work great:</strong><br/>
                  • "We have Sarah the mom, Mike the dad, Emma who's 16, Jake who's 12, and Lily who's 8"<br/>
                  • "There's me (Mom), my husband John, our teenager Alex (15), and our twins Ben and Sam who are both 10"<br/>
                  • "Our family includes Grandma Rose, Mom, Dad, big sister Katie (17), and little brother Max (6)"
                </div>
                
                <textarea
                  className="thin-scrollbar"
                  value={bulkText}
                  onChange={handleBulkTextChange}
                  placeholder="Describe your family members here... (e.g., 'We have Sarah the mom, Mike the dad, Emma who's 16...')"
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '1rem',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    resize: 'vertical'
                  }}
                  disabled={aiProcessing}
                />
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowBulkAdd(false)}
                    disabled={aiProcessing}
                    className="btn-secondary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      opacity: aiProcessing ? 0.6 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAdd}
                    disabled={aiProcessing || !bulkText.trim()}
                    className="btn-primary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (aiProcessing || !bulkText.trim()) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {aiProcessing ? 'AI Processing...' : 'Process with AI'}
                  </button>
                </div>
                
                {aiProcessing && (
                  <div className="info-box" style={{
                    marginTop: '1rem',
                    textAlign: 'center'
                  }}>
                    The AI is reading your family description and organizing the data...<br/>
                    This usually takes 3-5 seconds.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FIXED: AI Verification Modal - NO EMOJIS */}
        {showVerification && (
          <div className="modal-overlay" style={{ zIndex: 4000 }}>
            <div 
              className="modal-content thin-scrollbar"
              style={{
                maxWidth: '700px',
                width: '90%',
                maxHeight: '80vh'
              }}
            >
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>
                  Review AI Results
                </h3>
                <button
                  onClick={() => setShowVerification(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-color, #5a4033)' }}>
                  Here's what our AI found in your description. Please review and select which family members to add:
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  {aiProcessedMembers.map((member) => (
                    <div key={member.id} style={{
                      border: '2px solid var(--accent-color, #d4e3d9)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: member.selected ? 'rgba(104, 163, 149, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={member.selected}
                            onChange={() => toggleMemberSelection(member.id)}
                            style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                          />
                          <strong>{member.name}</strong>
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            padding: '0.25rem 0.5rem', 
                            background: relationshipTypes[member.relationship]?.color || 'gray',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {relationshipTypes[member.relationship]?.label || member.relationship}
                          </span>
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            padding: '0.25rem 0.5rem', 
                            background: 'var(--secondary-color, #d6a461)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}>
                            {accessLevels[member.accessLevel]?.label || member.accessLevel}
                          </span>
                        </div>
                        
                        {/* FIXED: Added Customize Button */}
                        {member.selected && (
                          <button
                            onClick={() => toggleMemberExpansion(member.id)}
                            className="btn-secondary"
                            style={{
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            {expandedMembers[member.id] ? 'Hide Details' : 'Customize'}
                          </button>
                        )}
                      </div>
                      
                      {/* Quick Status Display */}
                      <div className="info-box" style={{ 
                        marginBottom: expandedMembers[member.id] ? '0.75rem' : '0',
                        fontSize: '0.875rem'
                      }}>
                        <strong>Will be added as:</strong> {
                          member.relationship === 'out-of-nest' || member.relationship === 'special'
                            ? 'Context Only (no dashboard access)'
                            : 'Household Member (gets dashboard)'
                        }
                      </div>

                      {/* FIXED: Full Inline Customization Form */}
                      {member.selected && expandedMembers[member.id] && (
                        <div style={{ 
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '8px',
                          border: '1px solid var(--accent-color, #d4e3d9)'
                        }}>
                          {/* Name */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateProcessedMember(member.id, 'name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem'
                              }}
                            />
                          </div>

                          {/* Relationship */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                              Relationship
                            </label>
                            <select
                              value={member.relationship}
                              onChange={(e) => updateProcessedMember(member.id, 'relationship', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem'
                              }}
                            >
                              {Object.entries(relationshipTypes).map(([key, type]) => (
                                <option key={key} value={key} title={type.examples?.join(', ')}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            {relationshipTypes[member.relationship]?.examples && (
                              <div className="info-box" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                Examples: {relationshipTypes[member.relationship].examples?.join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Custom Role for Special */}
                          {member.relationship === 'special' && (
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Specify Role
                              </label>
                              <input
                                type="text"
                                value={member.notes?.includes('Role:') ? member.notes.split('Role: ')[1]?.split(',')[0] || '' : ''}
                                onChange={(e) => {
                                  const baseNotes = member.notes?.split('Role:')[0] || member.notes || '';
                                  const newNotes = e.target.value ? `${baseNotes}Role: ${e.target.value}` : baseNotes;
                                  updateProcessedMember(member.id, 'notes', newNotes);
                                }}
                                placeholder="e.g., Grandparent, Babysitter, Tutor"
                                style={{
                                  width: '100%',
                                  padding: '0.75rem'
                                }}
                              />
                            </div>
                          )}

                          {/* Household Status */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                              Household Status
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`household-ai-${member.id}`}
                                  checked={!(member.relationship === 'out-of-nest' || member.relationship === 'special')}
                                  onChange={() => {
                                    // Can't change if out-of-nest or special
                                    if (member.relationship !== 'out-of-nest' && member.relationship !== 'special') {
                                      updateProcessedMember(member.id, 'accessLevel', 'guided');
                                    }
                                  }}
                                  disabled={member.relationship === 'out-of-nest' || member.relationship === 'special'}
                                  style={{ marginRight: '0.5rem' }}
                                />
                                <span>
                                  <strong>Lives in household</strong> - Gets dashboard access
                                  {(member.relationship === 'out-of-nest' || member.relationship === 'special') && 
                                    <span style={{ opacity: 0.6 }}> (disabled for this relationship type)</span>
                                  }
                                </span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`household-ai-${member.id}`}
                                  checked={member.relationship === 'out-of-nest' || member.relationship === 'special'}
                                  onChange={() => updateProcessedMember(member.id, 'accessLevel', 'none')}
                                  style={{ marginRight: '0.5rem' }}
                                />
                                <span>
                                  <strong>Context only</strong> - No dashboard, just for AI context & birthdays
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Access Level - Only for household members */}
                          {!(member.relationship === 'out-of-nest' || member.relationship === 'special') && (
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Access Level
                              </label>
                              <select
                                value={member.accessLevel}
                                onChange={(e) => updateProcessedMember(member.id, 'accessLevel', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem'
                                }}
                              >
                                {Object.entries(accessLevels).filter(([key]) => key !== 'none').map(([key, level]) => (
                                  <option key={key} value={key}>{level.label} - {level.description}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Permission Template - Only for household members with Independent/Full access */}
                          {!(member.relationship === 'out-of-nest' || member.relationship === 'special') && 
                           (member.accessLevel === 'independent' || member.accessLevel === 'full') && (
                            <div style={{ marginBottom: '1rem' }}>
                              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Permission Template
                              </label>
                              <select
                                value={member.permissionTemplate || 'auto'}
                                onChange={(e) => updateProcessedMember(member.id, 'permissionTemplate', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem'
                                }}
                              >
                                <option value="auto">Auto-detect from relationship</option>
                                {Object.entries(permissionTemplates).map(([key, template]) => (
                                  <option key={key} value={key} title={template.description}>
                                    {template.name}
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-color, #5a4033)', opacity: 0.7, marginTop: '0.25rem' }}>
                                {member.permissionTemplate && member.permissionTemplate !== 'auto' 
                                  ? permissionTemplates[member.permissionTemplate]?.description
                                  : member.relationship === 'partner' 
                                    ? 'Partners get "Limited Partner" by default (can help but not break your system!)'
                                    : 'Will auto-assign appropriate permissions based on relationship'
                                }
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                              Notes
                            </label>
                            <textarea
                              value={member.notes}
                              onChange={(e) => updateProcessedMember(member.id, 'notes', e.target.value)}
                              placeholder={member.relationship === 'out-of-nest' || member.relationship === 'special'
                                ? "e.g., Lives in Chicago, visits monthly, loves soccer..."
                                : "Any special notes about this family member..."
                              }
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                  <button
                    onClick={retryAIProcessing}
                    className="btn-secondary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem'
                    }}
                  >
                    Try Again
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setShowVerification(false)}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-color, #5a4033)',
                        border: '1px solid var(--accent-color, #d4e3d9)',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAIMembers}
                      className="btn-primary"
                      style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}
                    >
                      Add Selected Members ({aiProcessedMembers.filter(m => m.selected).length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilySetupInterface;