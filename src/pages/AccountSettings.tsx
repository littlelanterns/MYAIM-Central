// src/pages/AccountSettings.tsx - Personal profile settings page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Palette, Save, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { personalThemes } from '../styles/colors';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // User data
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [themePreference, setThemePreference] = useState('classic');
  const [familyMemberId, setFamilyMemberId] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setEmail(user.email || '');

        // Get family member data
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .select('id, name, display_title, theme_preference')
          .eq('auth_user_id', user.id)
          .single();

        if (memberError) {
          console.error('Error loading member data:', memberError);
          setError('Could not load your profile data');
          setLoading(false);
          return;
        }

        if (memberData) {
          setFamilyMemberId(memberData.id);
          setName(memberData.name || '');
          setDisplayTitle(memberData.display_title || '');
          setThemePreference(memberData.theme_preference || 'classic');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleSave = async () => {
    if (!familyMemberId) {
      setError('Unable to save - no profile found');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      // Update family_members table
      const { error: updateError } = await supabase
        .from('family_members')
        .update({
          name: name.trim(),
          display_title: displayTitle.trim() || null,
          theme_preference: themePreference
        })
        .eq('id', familyMemberId);

      if (updateError) throw updateError;

      // Also update auth user metadata so it shows in Supabase dashboard
      const displayName = displayTitle.trim() || name.trim();
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          full_name: name.trim()
        }
      });

      if (metadataError) {
        console.warn('Could not update auth metadata:', metadataError);
        // Don't fail the whole save if metadata update fails
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--background-color, #fff4ec)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--accent-color, #d4e3d9)',
            borderTop: '3px solid var(--primary-color, #68a395)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background-color, #fff4ec)',
        padding: '1rem'
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
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

        {/* Main Card */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--accent-color, #d4e3d9)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
              color: 'white',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <User size={32} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              Account Settings
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Manage your personal profile
            </p>
          </div>

          {/* Form Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '2px solid #f44336',
                  color: '#d32f2f',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {saved && (
              <div
                style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '2px solid #4caf50',
                  color: '#2e7d32',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Check size={18} />
                Changes saved successfully!
              </div>
            )}

            {/* Email (Read-only) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--accent-color, #d4e3d9)',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  opacity: 0.7,
                  cursor: 'not-allowed'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                Email cannot be changed
              </p>
            </div>

            {/* Display Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                <User size={16} />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color, #68a395)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Display Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                Display Title (Optional)
              </label>
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
                placeholder="e.g., Mom, Dad, Grandma"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color, #68a395)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                This will be shown instead of your name if set
              </p>
            </div>

            {/* Theme Preference */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                <Palette size={16} />
                Theme Preference
              </label>
              <select
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color, #68a395)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {Object.entries(personalThemes).map(([key, theme]) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
                color: 'white',
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {saving ? (
                <>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Footer Links */}
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'var(--accent-color, #d4e3d9)',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <button
              onClick={() => navigate('/family-settings')}
              style={{
                width: '100%',
                background: 'transparent',
                border: '2px solid var(--primary-color, #68a395)',
                color: 'var(--primary-color, #68a395)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Manage Family Settings
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
