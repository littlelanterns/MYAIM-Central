import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Family {
  id: string;
  family_name: string;
  subscription_tier: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  dashboard_type: string;
  pin: string;
  age: number | null;
  theme_preference: string;
  avatar: string | null;
  color: string;
  requires_parent_approval: boolean;
  content_filter_level: string;
}

const FamilyMemberLogin = () => {
  // Multi-step state
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Family selection
  const [familyLoginName, setFamilyLoginName] = useState('');
  const [family, setFamily] = useState<Family | null>(null);

  // Step 2: Member selection + PIN
  const [memberName, setMemberName] = useState('');
  const [pin, setPin] = useState('');
  const [member, setMember] = useState<FamilyMember | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Step 1: Find family by login name
  const handleFindFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('id, family_name, subscription_tier')
        .eq('family_login_name', familyLoginName.trim().toLowerCase())
        .maybeSingle();

      if (familyError) throw familyError;

      if (!familyData) {
        throw new Error('Family not found. Please check the spelling and try again.');
      }

      // Set family and move to step 2
      setFamily(familyData);
      setStep(2);
    } catch (err: any) {
      console.error('Find family error:', err);
      setError(err.message || 'Could not find family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Find member and verify PIN
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!family) {
      setError('Family not found. Please start over.');
      setStep(1);
      return;
    }

    try {
      // Find family member by name within that family
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', family.id)
        .ilike('name', memberName.trim())
        .not('pin', 'is', null)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberData) {
        throw new Error('No family member with that name found. Check spelling or ask mom for help.');
      }

      // Verify PIN (direct comparison - these are simple family PINs)
      const isPINValid = pin === memberData.pin;

      if (!isPINValid) {
        throw new Error('Incorrect PIN. Try again or ask mom for help.');
      }

      // Check subscription tier allows dashboard access
      if (family.subscription_tier === 'basic') {
        throw new Error(
          'Your family needs an Enhanced or Premium subscription to use dashboards. Ask mom to upgrade!'
        );
      }

      // Success! Set up session
      setMember(memberData);

      // Store session data
      const sessionData = {
        family_id: family.id,
        family_member_id: memberData.id,
        name: memberData.name,
        role: memberData.role,
        age: memberData.age,
        dashboard_type: memberData.dashboard_type,
        theme_preference: memberData.theme_preference,
        color: memberData.color,
        login_type: 'family_member',
        requires_parent_approval: memberData.requires_parent_approval,
        content_filter_level: memberData.content_filter_level,
        relationship: memberData.relationship,
      };

      localStorage.setItem('aimfm_session', JSON.stringify(sessionData));
      localStorage.setItem('last_login_type', 'family_member');

      // All family members (children, partners, etc.) go to standalone dashboard
      // This is NOT under /commandcenter - it's a separate route for PIN-logged users
      // No access to Command Center, Library, Archives, or other mom-only features
      const redirectPath = `/family-dashboard/${memberData.id}`;
      console.log(`[PIN LOGIN] ${memberData.name} logged in, redirecting to standalone dashboard (${memberData.dashboard_type || 'guided'})`);

      navigate(redirectPath);

    } catch (err: any) {
      console.error('Member login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to step 1
  const handleBack = () => {
    setStep(1);
    setFamily(null);
    setMemberName('');
    setPin('');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background-color, #fff4ec)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'var(--background-color, #fff4ec)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--accent-color, #d4e3d9)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
            color: 'white',
            padding: '2rem 1.5rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
          >
            <svg
              style={{ width: '32px', height: '32px', color: 'white' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Family Member Login
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {step === 1
              ? 'Enter your family login name'
              : `Welcome, ${family?.family_name}!`}
          </p>
        </div>

        {/* Step 1: Family Name */}
        {step === 1 && (
          <form onSubmit={handleFindFamily} style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && (
                <div
                  style={{
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '2px solid #f44336',
                    color: '#d32f2f',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="familyName"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-color, #5a4033)',
                    marginBottom: '0.5rem'
                  }}
                >
                  Family Login Name
                </label>
                <input
                  type="text"
                  id="familyName"
                  value={familyLoginName}
                  onChange={(e) => setFamilyLoginName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: '2px solid var(--accent-color, #d4e3d9)',
                    color: 'var(--text-color, #5a4033)',
                    borderRadius: '8px',
                    fontSize: '1.125rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-color, #68a395)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="e.g., smith-family"
                  autoFocus
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-color, #5a4033)', opacity: 0.6 }}>
                  Ask mom for your family login name if you don't know it
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
                  color: 'white',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}
                    />
                    Finding Family...
                  </div>
                ) : (
                  'Find My Family'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Member Name + PIN */}
        {step === 2 && (
          <form onSubmit={handleMemberLogin} style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && (
                <div
                  style={{
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '2px solid #f44336',
                    color: '#d32f2f',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="memberName"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-color, #5a4033)',
                    marginBottom: '0.5rem'
                  }}
                >
                  Who are you?
                </label>
                <input
                  type="text"
                  id="memberName"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: '2px solid var(--accent-color, #d4e3d9)',
                    color: 'var(--text-color, #5a4033)',
                    borderRadius: '8px',
                    fontSize: '1.125rem',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-color, #68a395)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Type your first name"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="pin"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-color, #5a4033)',
                    marginBottom: '0.5rem'
                  }}
                >
                  PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: '2px solid var(--accent-color, #d4e3d9)',
                    color: 'var(--text-color, #5a4033)',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary-color, #68a395)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="••••"
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-color, #5a4033)', opacity: 0.6, textAlign: 'center' }}>
                  Enter your 4-digit PIN
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
                  color: 'white',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid white',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem'
                      }}
                    />
                    Logging In...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                style={{
                  width: '100%',
                  color: 'var(--text-color, #5a4033)',
                  opacity: 0.6,
                  fontSize: '0.875rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                ← Back to family name
              </button>
            </div>
          </form>
        )}

        {/* Help Section */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div
            style={{
              padding: '1rem',
              background: 'rgba(104, 163, 149, 0.1)',
              border: '1px solid var(--primary-color, #68a395)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            <h3
              style={{
                fontWeight: '600',
                color: 'var(--primary-color, #68a395)',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              Need Help?
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.8 }}>
              If you forgot your PIN or can't log in, ask mom to help you. She can reset your PIN or
              unlock your account if needed.
            </p>
          </div>

          {/* Back to Main Login */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-color, #5a4033)',
                opacity: 0.6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              ← Parents/Guardians login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberLogin;
