// src/pages/FamilySettings.tsx - REFACTORED with shared types
import React, { useState, useEffect, ChangeEvent, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Edit2, Check, AlertCircle, ChevronDown, ChevronUp, HelpCircle, CheckCircle, XCircle, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  saveFamilySetup,
  saveFamilyMember,
  getFamilyMembers,
  getFamilyByUserId,
  deleteFamilyMember
} from '../lib/api';
import { processFamilyDescription } from '../lib/aiServices';
import { checkFamilyLoginNameAvailable } from '../lib/betaSignupService';
import FamilyMemberForm from '../components/family/FamilyMemberForm';

// Import shared types
import { FamilyMember, RelationshipType, AccessLevel, ShowPermissionsState, CollapsedState, DragState } from '../types';

// Remove duplicate interface definitions - now imported from shared types

const FamilySetupInterface: React.FC = () => {
  const navigate = useNavigate();
  const [familyName, setFamilyName] = useState<string>('');
  const [familyLoginName, setFamilyLoginName] = useState<string>('');
  const [originalLoginName, setOriginalLoginName] = useState<string>('');
  const [isEditingLoginName, setIsEditingLoginName] = useState<boolean>(false);
  const [loginNameStatus, setLoginNameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error?: string;
  }>({ checking: false, available: null });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showPermissions, setShowPermissions] = useState<ShowPermissionsState>({});
  const [collapsed, setCollapsed] = useState<CollapsedState>({});
  const [visiblePins, setVisiblePins] = useState<Record<string | number, boolean>>({});
  const [showBulkAdd, setShowBulkAdd] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [aiProcessing, setAiProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  
  // AI Verification states - now using unified FamilyMember interface
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [aiProcessedMembers, setAiProcessedMembers] = useState<FamilyMember[]>([]);
  const [aiOriginalText, setAiOriginalText] = useState<string>('');
  
  // Draggable functionality
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const modalRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get authenticated user on mount
  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        } else {
          // No authenticated user - redirect to login
          console.log('No authenticated user, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error getting authenticated user:', error);
        navigate('/login');
      }
    };
    getAuthUser();
  }, [navigate]);

  // Debounced check for login name availability when editing
  useEffect(() => {
    if (!isEditingLoginName) return;

    const loginName = familyLoginName.trim();

    // If unchanged from original, it's available (it's the current value)
    if (loginName === originalLoginName) {
      setLoginNameStatus({ checking: false, available: true });
      return;
    }

    // Reset status if empty or too short
    if (loginName.length < 3) {
      setLoginNameStatus({ checking: false, available: null });
      return;
    }

    // Set checking state
    setLoginNameStatus({ checking: true, available: null });

    // Debounce the check
    const timeoutId = setTimeout(async () => {
      const result = await checkFamilyLoginNameAvailable(loginName, currentFamilyId || undefined);
      setLoginNameStatus({
        checking: false,
        available: result.available,
        error: result.error
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [familyLoginName, isEditingLoginName, originalLoginName, currentFamilyId]);

  // Handle login name input - auto-lowercase and strip invalid chars
  const handleLoginNameChange = useCallback((value: string) => {
    const normalized = value.toLowerCase().replace(/\s+/g, '-');
    // Allow lowercase letters, numbers, hyphens, &, _, !
    const cleaned = normalized.replace(/[^a-z0-9\-&_!]/g, '');
    setFamilyLoginName(cleaned);
  }, []);

  // Cancel login name editing
  const cancelLoginNameEdit = useCallback(() => {
    setFamilyLoginName(originalLoginName);
    setIsEditingLoginName(false);
    setLoginNameStatus({ checking: false, available: null });
  }, [originalLoginName]);

  // Save login name immediately to database
  const saveLoginName = async () => {
    if (!currentFamilyId) {
      alert('Please save your family setup first before setting a login ID.');
      return;
    }

    if (loginNameStatus.checking) {
      alert('Please wait while we check availability.');
      return;
    }

    if (loginNameStatus.available === false && familyLoginName !== originalLoginName) {
      alert('This login ID is not available. Please choose a different one.');
      return;
    }

    if (familyLoginName.trim().length < 3) {
      alert('Login ID must be at least 3 characters.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('families')
        .update({ family_login_name: familyLoginName.toLowerCase().trim() })
        .eq('id', currentFamilyId);

      if (error) throw error;

      setOriginalLoginName(familyLoginName.toLowerCase().trim());
      setIsEditingLoginName(false);
      setLoginNameStatus({ checking: false, available: null });
    } catch (error) {
      console.error('Error saving login name:', error);
      alert('Failed to save login ID: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Relationship types with "out-of-nest" terminology
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
    'partner-full': {
      name: 'Full Partner',
      description: 'Complete access for your spouse/partner',
      permissions: Object.keys(permissions)
    },
    'partner-limited': {
      name: 'Limited Partner',
      description: 'Most features except sensitive settings',
      permissions: [
        'view-family-calendar', 'edit-family-calendar', 'create-tasks', 'edit-all-tasks',
        'view-finances', 'view-private-notes', 'edit-private-notes', 'view-usage-analytics'
      ]
    },
    'teen-independent': {
      name: 'Independent Teen',
      description: 'Self-managing teen with basic permissions',
      permissions: [
        'view-family-calendar', 'edit-family-calendar', 'view-finances', 'view-private-notes'
      ]
    },
    'child-guided': {
      name: 'Guided Child',
      description: 'Basic viewing permissions for younger children',
      permissions: ['view-family-calendar', 'view-finances']
    },
    'view-only': {
      name: 'View Only',
      description: 'Can see information but not edit anything',
      permissions: ['view-family-calendar', 'view-finances', 'view-private-notes']
    }
  };

  // Load family data when currentUserId is available
  useEffect(() => {
    if (currentUserId) {
      loadFamilyData();
    }
  }, [currentUserId]);

  const loadFamilyData = async (): Promise<void> => {
    try {
      setLoading(true);
      const familyResult = await getFamilyByUserId(currentUserId);

      if (familyResult.success && familyResult.family) {
        setCurrentFamilyId(familyResult.family.id);
        setFamilyName(familyResult.family.family_name || '');
        setFamilyLoginName(familyResult.family.family_login_name || '');
        setOriginalLoginName(familyResult.family.family_login_name || '');

        const membersResult = await getFamilyMembers(familyResult.family.id);
        if (membersResult.success) {
          setFamilyMembers(membersResult.members || []);
        }
      } else {
        // No family found yet - this is okay for new users
        console.log('No family data found yet - user can create new family');
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new blank family member
  const addFamilyMember = (): void => {
    const newMember: FamilyMember = {
      id: Date.now(),
      name: '',
      nicknames: [],
      birthday: '',
      relationship: 'child',
      customRole: '',
      accessLevel: 'guided',
      inHousehold: true,
      permissions: {},
      notes: '',
      family_id: currentFamilyId || undefined
    };
    
    setFamilyMembers([...familyMembers, newMember]);
    setCollapsed({ ...collapsed, [newMember.id]: false });
  };

  // Update family member field
  const updateMember = (id: string | number, field: keyof FamilyMember, value: any): void => {
    setFamilyMembers(members =>
      members.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  // Toggle individual permission for a family member
  const togglePermission = (id: string | number, permission: string): void => {
    setFamilyMembers(members =>
      members.map(member =>
        member.id === id
          ? {
              ...member,
              permissions: {
                ...member.permissions,
                [permission]: !member.permissions[permission]
              }
            }
          : member
      )
    );
  };

  // Delete family member
  const deleteMember = (id: string | number): void => {  
    setFamilyMembers(members => members.filter(member => member.id !== id));
    const newCollapsed = { ...collapsed };
    delete newCollapsed[id];
    setCollapsed(newCollapsed);
  };

  // Save individual family member
  const saveMember = async (memberId: string | number): Promise<void> => {
    try {
      setSaving(true);
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) return;

      // Validate PIN if member needs dashboard access
      if (member.inHousehold && member.accessLevel !== 'none') {
        if (!member.pin || member.pin.length !== 4 || !/^\d{4}$/.test(member.pin)) {
          alert(`${member.name || 'This member'} needs a 4-digit PIN to log into their dashboard. Please set a PIN before saving.`);
          setSaving(false);
          return;
        }
      }

      const memberData = {
        ...member,
        family_id: currentFamilyId
      };

      const result = await saveFamilyMember(memberData);
      if (result.success) {
        setCollapsed({ ...collapsed, [memberId]: true });
      } else {
        throw new Error(result.error || 'Failed to save member');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save family member: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Save entire family setup
  const handleSaveFamilySetup = async (): Promise<void> => {
    try {
      setSaving(true);

      if (!familyName.trim()) {
        alert('Please enter a family name.');
        setSaving(false);
        return;
      }

      // If login name was edited, validate it
      if (isEditingLoginName && familyLoginName !== originalLoginName) {
        if (!loginNameStatus.available) {
          alert('Please choose an available Family Login ID before saving.');
          setSaving(false);
          return;
        }
      }

      // Build family data - only include login name if we have one
      const familyData: any = {
        auth_user_id: currentUserId,
        family_name: familyName,
        subscription_tier: 'basic'
      };

      // Only update login name if it's changed and valid
      if (familyLoginName && (familyLoginName !== originalLoginName || !originalLoginName)) {
        familyData.family_login_name = familyLoginName.toLowerCase().trim();
      } else if (originalLoginName) {
        // Preserve existing login name
        familyData.family_login_name = originalLoginName;
      }

      // Step 1: Save family metadata
      const result = await saveFamilySetup(familyData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save family setup');
      }

      const familyId = result.familyId;
      setCurrentFamilyId(familyId);

      // Update original login name to reflect saved value
      if (familyData.family_login_name) {
        setOriginalLoginName(familyData.family_login_name);
      }
      setIsEditingLoginName(false);

      // Step 2: Validate all members before saving
      for (const member of familyMembers) {
        if (member.inHousehold && member.accessLevel !== 'none') {
          if (!member.pin || member.pin.length !== 4 || !/^\d{4}$/.test(member.pin)) {
            alert(`${member.name || 'A family member'} needs a 4-digit PIN. Please set PINs for all members before saving.`);
            setSaving(false);
            return;
          }
        }
      }

      // Step 3: Save all family members
      let savedCount = 0;
      let failedCount = 0;

      for (const member of familyMembers) {
        try {
          const memberData = {
            ...member,
            family_id: familyId
          };
          const memberResult = await saveFamilyMember(memberData);
          if (memberResult.success) {
            savedCount++;
          } else {
            failedCount++;
            console.error(`Failed to save ${member.name}:`, memberResult.error);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error saving ${member.name}:`, error);
        }
      }

      // Show results
      if (failedCount > 0) {
        alert(`Family setup saved! ${savedCount} members saved, ${failedCount} failed. Check console for details.`);
      } else {
        alert(`Family setup saved successfully! ${savedCount} members saved.`);
      }

      // Collapse all member cards after successful save
      const newCollapsed: Record<string | number, boolean> = {};
      familyMembers.forEach(m => {
        newCollapsed[m.id] = true;
      });
      setCollapsed(newCollapsed);

    } catch (error) {
      console.error('Error saving family setup:', error);
      alert('Failed to save family setup: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // AI Bulk Add functionality
  const handleBulkAdd = async (): Promise<void> => {
    if (!bulkText.trim()) {
      alert('Please enter a family description.');
      return;
    }

    try {
      setAiProcessing(true);
      const result = await processFamilyDescription(bulkText, familyMembers) as any;
      
      if (!result.success) {
        throw new Error(result.error || 'AI processing failed');
      }

      if (result.duplicates && result.duplicates.length > 0) {
        alert(`Some family members might already exist: ${result.duplicates.map((d: any) => d.name).join(', ')}. They might already exist in your family.`);
        return;
      }

      // Convert AI results to unified FamilyMember format
      const processedMembers: FamilyMember[] = result.newMembers.map((member: any) => {
        console.log(`[FamilySettings] Processing ${member.name}:`, {
          accessLevel: member.accessLevel,
          dashboard_type: member.dashboard_type,
          pin: member.pin,
          inHousehold: member.inHousehold
        });

        // Apply smart defaults for permissions
        let permissions: Record<string, boolean> = {};
        
        if (member.inHousehold) {
          if (member.relationship === 'partner') {
            const template = permissionTemplates['partner-limited'];
            template.permissions.forEach((perm: string) => {
              permissions[perm] = true;
            });
          } else if (member.relationship === 'child') {
            permissions['view-family-calendar'] = true;
            permissions['view-finances'] = true;
          }
        }

        return {
          id: member.id || Date.now() + Math.random(),
          name: member.name,
          nicknames: member.nicknames || [],
          birthday: member.birthday || '',
          relationship: member.relationship === 'adult-child' ? 'out-of-nest' : member.relationship,
          customRole: member.customRole || '',
          accessLevel: member.accessLevel,
          dashboard_type: member.dashboard_type, // Preserve AI-calculated dashboard type
          pin: member.pin || '0000', // Preserve AI-generated PIN
          inHousehold: member.inHousehold,
          permissions: permissions,
          notes: member.notes || '',
          family_id: currentFamilyId,
          selected: true // Default to selected for AI members
        };
      });

      setAiProcessedMembers(processedMembers);
      setAiOriginalText(bulkText);
      setShowVerification(true);
      setShowBulkAdd(false);

    } catch (error) {
      console.error('Bulk add error:', error);
      alert('Something went wrong with AI processing: ' + (error as Error).message);
    } finally {
      setAiProcessing(false);
    }
  };

  // Update AI processed member (unified with regular members)
  const updateAiMember = (id: string | number, field: keyof FamilyMember, value: any): void => {
    setAiProcessedMembers(members => 
      members.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  // Toggle AI member selection
  const toggleAiMemberSelection = (memberId: string | number): void => {
    setAiProcessedMembers(members =>
      members.map(member =>
        member.id === memberId 
          ? { ...member, selected: !(member.selected ?? true) } 
          : member
      )
    );
  };

  // Confirm and add selected AI members
  const confirmAIMembers = async (): Promise<void> => {
    const selectedMembers = aiProcessedMembers.filter((member) => member.selected !== false);

    if (selectedMembers.length === 0) {
      alert('Please select at least one family member to add.');
      return;
    }

    // Validate all members have PINs before saving
    for (const member of selectedMembers) {
      if (member.inHousehold && member.accessLevel !== 'none') {
        if (!member.pin || member.pin.length !== 4 || !/^\d{4}$/.test(member.pin)) {
          alert(`${member.name || 'A family member'} needs a 4-digit PIN. Please set PINs for all members before confirming.`);
          return;
        }
      }
    }

    setSaving(true);

    try {
      // Check if any selected member is the primary parent (self)
      const selfMember = selectedMembers.find(m => m.relationship === 'self');

      // Find existing Primary Parent placeholder
      const existingPrimaryParent = familyMembers.find(m =>
        m.name === 'Primary Parent'
      );

      let updatedFamilyMembers = [...familyMembers];
      let membersToSave = [...selectedMembers];

      if (selfMember && existingPrimaryParent) {
        // Update existing Primary Parent record instead of creating new
        updatedFamilyMembers = familyMembers.map(m => {
          if (m.id === existingPrimaryParent.id) {
            // Replace placeholder with self member data, keeping original ID
            return { ...selfMember, id: m.id };
          }
          return m;
        });

        // Save updated Primary Parent
        const primaryData = { ...selfMember, id: existingPrimaryParent.id, family_id: currentFamilyId };
        await saveFamilyMember(primaryData);

        // Add remaining members (excluding self)
        const othersToAdd = selectedMembers
          .filter(m => m.relationship !== 'self')
          .map(({ selected, ...member }) => member);

        updatedFamilyMembers = [...updatedFamilyMembers, ...othersToAdd];
        membersToSave = othersToAdd;
      } else {
        // Normal flow - no Primary Parent replacement needed
        const membersToAdd = selectedMembers.map(({ selected, ...member }) => member);
        updatedFamilyMembers = [...familyMembers, ...membersToAdd];
        membersToSave = membersToAdd;
      }

      // Save all new members to database
      let savedCount = selfMember && existingPrimaryParent ? 1 : 0; // Count Primary Parent if replaced
      let failedCount = 0;

      for (const member of membersToSave) {
        try {
          const memberData = {
            ...member,
            family_id: currentFamilyId
          };
          const result = await saveFamilyMember(memberData);
          if (result.success) {
            savedCount++;
          } else {
            failedCount++;
            console.error(`Failed to save ${member.name}:`, result.error);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error saving ${member.name}:`, error);
        }
      }

      // Update state with all members
      setFamilyMembers(updatedFamilyMembers);

      // Show results
      if (failedCount > 0) {
        alert(`${savedCount} members saved, ${failedCount} failed. Check console for details.`);
      } else {
        alert(`Success! ${savedCount} family members saved to database.`);
      }

      setShowVerification(false);
      setAiProcessedMembers([]);
      setBulkText('');
    } catch (error) {
      console.error('Error confirming AI members:', error);
      alert('Failed to save members: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Retry AI processing
  const retryAIProcessing = (): void => {
    setShowVerification(false);
    setShowBulkAdd(true);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--background-color, #fff4ec)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>Loading your family setup...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec), var(--accent-color, #d4e3d9)))',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/commandcenter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--primary-color, #68a395)',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '0.5rem 0',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={18} />
          Back to Command Center
        </button>

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--accent-color, #d4e3d9)'
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              background: 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Family Settings
            </h1>
            <p style={{ color: 'var(--text-color, #5a4033)', opacity: 0.8 }}>
              Set up your family members and their access permissions
            </p>
          </div>

          {/* Family Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Family Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Smith Family"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent-color, #d4e3d9)' }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-color, #5a4033)', opacity: 0.7, marginTop: '0.25rem' }}>
              Display name shown throughout the app
            </p>
          </div>

          {/* Family Login ID */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Family Login ID
              <span title="Family members use this ID to log in to their dashboards">
                <HelpCircle
                  size={16}
                  style={{ opacity: 0.6, cursor: 'help' }}
                />
              </span>
            </label>

            {!isEditingLoginName ? (
              // Display mode
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                background: 'var(--background-color, #fff4ec)',
                borderRadius: '8px',
                border: '1px solid var(--accent-color, #d4e3d9)'
              }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  color: 'var(--primary-color, #68a395)',
                  fontWeight: '600'
                }}>
                  {familyLoginName || '(not set)'}
                </span>
                <button
                  onClick={() => setIsEditingLoginName(true)}
                  style={{
                    marginLeft: 'auto',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    background: 'var(--secondary-color, #d6a461)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {familyLoginName ? 'Change' : 'Set Login ID'}
                </button>
              </div>
            ) : (
              // Edit mode
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={familyLoginName}
                    onChange={(e) => handleLoginNameChange(e.target.value)}
                    placeholder="e.g., smith-family or mom&dad"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '2.5rem',
                      fontFamily: 'monospace',
                      borderRadius: '8px',
                      border: `2px solid ${
                        loginNameStatus.available === true ? 'var(--primary-color, #68a395)' :
                        loginNameStatus.available === false ? '#b25a58' :
                        'var(--accent-color, #d4e3d9)'
                      }`
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    {loginNameStatus.checking && (
                      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} color="var(--primary-color, #68a395)" />
                    )}
                    {!loginNameStatus.checking && loginNameStatus.available === true && (
                      <CheckCircle size={18} color="var(--primary-color, #68a395)" />
                    )}
                    {!loginNameStatus.checking && loginNameStatus.available === false && (
                      <XCircle size={18} color="#b25a58" />
                    )}
                  </div>
                </div>

                {/* Status messages */}
                {loginNameStatus.error && (
                  <p style={{ color: '#b25a58', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {loginNameStatus.error}
                  </p>
                )}
                {!loginNameStatus.checking && loginNameStatus.available === true && familyLoginName !== originalLoginName && (
                  <p style={{ color: 'var(--primary-color, #68a395)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    ✓ Available!
                  </p>
                )}
                {!loginNameStatus.checking && loginNameStatus.available === false && !loginNameStatus.error && (
                  <p style={{ color: '#b25a58', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    This login ID is already taken
                  </p>
                )}

                {/* Edit actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={saveLoginName}
                    disabled={saving || loginNameStatus.checking || (loginNameStatus.available === false && familyLoginName !== originalLoginName)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      background: loginNameStatus.available === true || familyLoginName === originalLoginName
                        ? 'var(--primary-color, #68a395)'
                        : 'var(--accent-color, #d4e3d9)',
                      color: loginNameStatus.available === true || familyLoginName === originalLoginName
                        ? 'white'
                        : 'var(--text-color, #5a4033)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: saving || loginNameStatus.checking || (loginNameStatus.available === false && familyLoginName !== originalLoginName)
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: (saving || loginNameStatus.checking) ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Saving...' : loginNameStatus.checking ? 'Checking...' : 'Save Login ID'}
                  </button>
                  <button
                    onClick={cancelLoginNameEdit}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      background: 'transparent',
                      color: 'var(--text-color, #5a4033)',
                      border: '1px solid var(--accent-color, #d4e3d9)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-color, #5a4033)', opacity: 0.7, marginTop: '0.5rem' }}>
              Family members use this ID to access their dashboards. Get creative! Examples: mom&dad, pizza_party!, adventure_squad
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={addFamilyMember}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Add Family Member
            </button>
            
            <button
              onClick={() => setShowBulkAdd(true)}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Bulk Add with AI
            </button>
          </div>

          {/* Family Members List */}
          <div style={{ marginBottom: '2rem' }}>
            {familyMembers.map((member) => (
              <div key={member.id} className="family-member-card">
                
                {/* Collapsed View */}
                {collapsed[member.id] ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto' }}>
                      <div style={{ flex: '1 1 auto' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-color, #5a4033)' }}>
                          {member.name || 'Unnamed Member'}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="status-badge household">
                            {relationshipTypes[member.relationship]?.label || member.relationship}
                          </span>
                          {member.inHousehold ? (
                            <span className="status-badge access-level">
                              {(member.relationship === 'partner' || member.relationship === 'special')
                                ? 'Additional Adult'
                                : (accessLevels[member.accessLevel]?.label || member.accessLevel)}
                            </span>
                          ) : (
                            <span className="status-badge context-only">Context Only</span>
                          )}
                          {/* PIN Display */}
                          {member.inHousehold && member.accessLevel !== 'none' && member.pin && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.25rem 0.75rem',
                              background: 'var(--accent-color, #d4e3d9)',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'var(--text-color, #5a4033)'
                            }}>
                              <span>PIN:</span>
                              <span style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                                {visiblePins[member.id] ? member.pin : '••••'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVisiblePins({ ...visiblePins, [member.id]: !visiblePins[member.id] });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title={visiblePins[member.id] ? 'Hide PIN' : 'Show PIN'}
                              >
                                {visiblePins[member.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        onClick={() => setCollapsed({ ...collapsed, [member.id]: false })}
                        style={{
                          background: 'var(--primary-color, #68a395)',
                          color: 'white',
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteMember(member.id)}
                        style={{
                          background: 'var(--accent-secondary, #b25a58)',
                          color: 'white',
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Expanded View - Using FamilyMemberForm */
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => saveMember(member.id)}
                      disabled={saving}
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'var(--primary-color, #68a395)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        opacity: saving ? 0.7 : 1,
                        zIndex: 10
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>

                    <FamilyMemberForm
                      member={member}
                      onUpdate={updateMember}
                      onTogglePermission={togglePermission}
                      isPermissionsSectionVisible={!!showPermissions[member.id]}
                      onShowPermissionsToggle={() => setShowPermissions({ 
                        ...showPermissions, 
                        [member.id]: !showPermissions[member.id] 
                      })}
                      relationshipTypes={relationshipTypes}
                      accessLevels={accessLevels}
                      permissions={permissions}
                      permissionTemplates={permissionTemplates}
                      isSaving={saving}
                    />
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

          {/* Save Button */}
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

        {/* Bulk Add Modal */}
        {showBulkAdd && (
          <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-content thin-scrollbar" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh' }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Bulk Add Family Members with AI</h3>
                <button onClick={() => setShowBulkAdd(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-color, #5a4033)', marginBottom: '1rem' }}>
                  Just describe your family in natural language! Our AI will organize it automatically.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Describe Your Family
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="e.g., I'm Sarah, married to Mike. We have 3 kids: Emma (16), Jake (12), and Lily (8). My mother-in-law Joan helps with babysitting. My adult daughter from my first marriage, Ashley (22), is in college but visits often..."
                    rows={6}
                    style={{ width: '100%', padding: '0.75rem', resize: 'vertical' }}
                  />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleBulkAdd}
                    disabled={aiProcessing}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', opacity: aiProcessing ? 0.7 : 1 }}
                  >
                    {aiProcessing ? 'AI Processing...' : 'Process with AI'}
                  </button>
                </div>
                
                {aiProcessing && (
                  <div className="info-box" style={{ marginTop: '1rem', textAlign: 'center' }}>
                    The AI is reading your family description and organizing the data...<br/>
                    This usually takes 3-5 seconds.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Verification Modal */}
        {showVerification && (
          <div className="modal-overlay" style={{ zIndex: 4000 }}>
            <div className="modal-content thin-scrollbar" style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh' }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Review AI Results</h3>
                <button onClick={() => setShowVerification(false)} className="modal-close-btn">
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '2rem' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-color, #5a4033)' }}>
                  Here's what our AI found in your description. Review and customize each member:
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  {aiProcessedMembers.map((member) => (
                    <div key={member.id} style={{
                      border: '2px solid var(--accent-color, #d4e3d9)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}>
                      
                      {/* Member Header with Checkbox */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '600' }}>
                          <input
                            type="checkbox"
                            checked={member.selected !== false}
                            onChange={() => toggleAiMemberSelection(member.id)}
                            style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                          />
                          {member.name}
                        </label>
                        
                        <button
                          onClick={() => setShowPermissions({ 
                            ...showPermissions, 
                            [`ai-${member.id}`]: !showPermissions[`ai-${member.id}`] 
                          })}
                          style={{
                            background: 'var(--secondary-color, #d6a461)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {showPermissions[`ai-${member.id}`] ? 'Hide Details' : 'Customize'}
                        </button>
                      </div>

                      {/* Detected Info Summary */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span className="status-badge household">
                          {relationshipTypes[member.relationship]?.label || member.relationship}
                        </span>
                        {member.inHousehold ? (
                          <span className="status-badge access-level">
                            {(member.relationship === 'partner' || member.relationship === 'special')
                              ? 'Additional Adult'
                              : member.relationship === 'child' && member.dashboard_type
                                ? (member.dashboard_type === 'play' ? 'Play Mode' :
                                   member.dashboard_type === 'guided' ? 'Guided Mode' :
                                   member.dashboard_type === 'independent' ? 'Independent Mode' :
                                   member.dashboard_type)
                                : (accessLevels[member.accessLevel]?.label || member.accessLevel)}
                          </span>
                        ) : (
                          <span className="status-badge context-only">Context Only</span>
                        )}
                      </div>

                      {/* Expanded Form (using FamilyMemberForm) */}
                      {showPermissions[`ai-${member.id}`] && (
                        <div style={{ 
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '8px',
                          border: '1px solid var(--accent-color, #d4e3d9)'
                        }}>
                          <FamilyMemberForm
                            member={member}
                            onUpdate={updateAiMember}
                            onTogglePermission={(id, perm) => {
                              setAiProcessedMembers(members => members.map(m => m.id === id ? {
                                ...m,
                                permissions: { ...m.permissions, [perm]: !m.permissions[perm]}
                              } : m))
                            }}
                            isPermissionsSectionVisible={!!showPermissions[`ai-${member.id}`]}
                            onShowPermissionsToggle={() => setShowPermissions(prev => ({ 
                              ...prev, 
                              [`ai-${member.id}`]: !prev[`ai-${member.id}`] 
                            }))}
                            relationshipTypes={relationshipTypes}
                            accessLevels={accessLevels}
                            permissions={permissions}
                            permissionTemplates={permissionTemplates}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                  <button
                    onClick={retryAIProcessing}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
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
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAIMembers}
                      className="btn-primary"
                      style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600' }}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : `Add Selected Members (${aiProcessedMembers.filter((m) => m.selected !== false).length})`}
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