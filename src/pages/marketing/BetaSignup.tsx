import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Sparkles, HelpCircle, CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { primaryBrand, colorPalette } from '../../styles/colors';
import { createBetaAccount, getFoundingFamilyCount, checkFamilyLoginNameAvailable } from '../../lib/betaSignupService';

const BetaSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    familyName: '',
    familyLoginName: '',
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login name availability checking
  const [loginNameStatus, setLoginNameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error?: string;
  }>({ checking: false, available: null });
  const [showFamilyNameTooltip, setShowFamilyNameTooltip] = useState(false);
  const [showLoginNameTooltip, setShowLoginNameTooltip] = useState(false);

  useEffect(() => {
    // Load current founding family count
    async function loadCount() {
      const count = await getFoundingFamilyCount();
      setSpotsRemaining(100 - count);
    }
    loadCount();
  }, []);

  // Debounced check for login name availability
  useEffect(() => {
    const loginName = formData.familyLoginName.trim();

    // Reset status if empty or too short
    if (loginName.length < 3) {
      setLoginNameStatus({ checking: false, available: null });
      return;
    }

    // Set checking state
    setLoginNameStatus({ checking: true, available: null });

    // Debounce the check
    const timeoutId = setTimeout(async () => {
      const result = await checkFamilyLoginNameAvailable(loginName);
      setLoginNameStatus({
        checking: false,
        available: result.available,
        error: result.error
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.familyLoginName]);

  // Handle login name input - auto-lowercase and strip invalid chars
  const handleLoginNameChange = useCallback((value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    const normalized = value.toLowerCase().replace(/\s+/g, '-');
    // Remove invalid characters (keep lowercase letters, numbers, hyphens, &, _, !)
    const cleaned = normalized.replace(/[^a-z0-9\-&_!]/g, '');
    setFormData(prev => ({ ...prev, familyLoginName: cleaned }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.familyName || !formData.familyLoginName) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.agreedToTerms) {
      setError('Please agree to the Founding Family terms');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!loginNameStatus.available) {
      setError('Please choose an available Family Login ID');
      return;
    }

    setLoading(true);

    try {
      const result = await createBetaAccount({
        email: formData.email,
        password: formData.password,
        familyName: formData.familyName,
        familyLoginName: formData.familyLoginName
      });

      if (result.success) {
        // Show email confirmation message
        setSignupSuccess(true);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.sageTeal}, ${primaryBrand.deepOcean})`,
        padding: '3rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: primaryBrand.goldenHoney,
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={40} />
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '1rem'
          }}>
            Become a Founding Family
          </h1>
          <p style={{
            fontSize: '1.3rem',
            opacity: 0.95,
            marginBottom: '0.5rem'
          }}>
            Beta is FREE because we need your brilliance (and your honest feedback about what we're missing)
          </p>
          {spotsRemaining !== null && spotsRemaining > 0 && (
            <div style={{
              background: primaryBrand.goldenHoney,
              color: primaryBrand.warmEarth,
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              Only {spotsRemaining} Founding Family spots remaining!
            </div>
          )}
        </div>
      </section>

      {/* Email Confirmation Success Message */}
      {signupSuccess && (
        <section style={{
          padding: '4rem 2rem',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            border: `3px solid ${primaryBrand.sageTeal}`
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: primaryBrand.softSage,
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={40} color={primaryBrand.sageTeal} />
            </div>
            <h2 style={{
              fontSize: '2rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1rem'
            }}>
              Check Your Email!
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              We've sent a confirmation link to <strong>{formData.email}</strong>.
              Click the link in your email to activate your Founding Family account.
            </p>
            <div style={{
              background: primaryBrand.softSage,
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                color: primaryBrand.warmEarth,
                marginBottom: '0.75rem'
              }}>
                What's Next?
              </h3>
              <ol style={{
                textAlign: 'left',
                margin: 0,
                paddingLeft: '1.5rem',
                color: colorPalette.brown.dark,
                lineHeight: 1.8
              }}>
                <li>Check your inbox (and spam folder, just in case)</li>
                <li>Click the confirmation link in the email</li>
                <li>You'll be redirected to set up your family</li>
              </ol>
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: colorPalette.brown.medium
            }}>
              Didn't receive the email?{' '}
              <button
                onClick={() => setSignupSuccess(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: primaryBrand.sageTeal,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Try signing up again
              </button>
            </p>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!signupSuccess && (
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem'
        }}>
          {/* Benefits Column */}
          <div>
            <h2 style={{
              fontSize: '2rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1.5rem'
            }}>
              Founding Family Benefits
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              {[
                'Full access during beta (yes, everything)',
                'FREE during entire beta (we mean it)',
                'Your feedback literally shapes what we build',
                'Lock in Founding Family pricing forever',
                '15-20% discount locked in (as long as you stay subscribed)',
                'A cool Founding Family badge (because why not)',
                'We answer your emails first',
                'New features? You get them first'
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}
                >
                  <Check size={24} color={primaryBrand.sageTeal} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{
                    fontSize: '1.05rem',
                    color: colorPalette.brown.dark,
                    lineHeight: 1.5
                  }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: primaryBrand.softSage,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `2px solid ${primaryBrand.sageTeal}`
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: primaryBrand.warmEarth,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={24} />
                Important Note
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: colorPalette.brown.dark,
                lineHeight: 1.6
              }}>
                When we launch for real, you get a 14-day trial. Then we automatically enroll you at your
                locked Founding Family rate. That discount? Yours forever, as long as you keep your
                subscription active. Cancel and come back later? Regular pricing (sorry, we tried to warn you).
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div>
            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              border: `3px solid ${primaryBrand.goldenHoney}`
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                color: primaryBrand.warmEarth,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Create Your Account
              </h2>

              {error && (
                <div style={{
                  background: colorPalette.red.light,
                  color: colorPalette.red.deepest,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: primaryBrand.warmEarth,
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: `2px solid ${primaryBrand.softSage}`,
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryBrand.sageTeal}
                    onBlur={(e) => e.target.style.borderColor = primaryBrand.softSage}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: primaryBrand.warmEarth,
                    marginBottom: '0.5rem'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: `2px solid ${primaryBrand.softSage}`,
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryBrand.sageTeal}
                    onBlur={(e) => e.target.style.borderColor = primaryBrand.softSage}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: primaryBrand.warmEarth,
                    marginBottom: '0.5rem'
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter your password"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: `2px solid ${formData.confirmPassword && formData.password !== formData.confirmPassword ? colorPalette.red.medium : primaryBrand.softSage}`,
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryBrand.sageTeal}
                    onBlur={(e) => e.target.style.borderColor = formData.confirmPassword && formData.password !== formData.confirmPassword ? colorPalette.red.medium : primaryBrand.softSage}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ color: colorPalette.red.medium, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: primaryBrand.warmEarth,
                    marginBottom: '0.5rem'
                  }}>
                    Family Name
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <HelpCircle
                        size={16}
                        style={{ cursor: 'pointer', opacity: 0.7 }}
                        onMouseEnter={() => setShowFamilyNameTooltip(true)}
                        onMouseLeave={() => setShowFamilyNameTooltip(false)}
                      />
                      {showFamilyNameTooltip && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: primaryBrand.warmEarth,
                          color: 'white',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          width: '220px',
                          zIndex: 10,
                          marginBottom: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          <strong>Display Name</strong>
                          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
                            This is how your family appears in the app. Examples: "The Smith Family", "Team Johnson", "Casa Martinez"
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="The Smith Family"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: `2px solid ${primaryBrand.softSage}`,
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = primaryBrand.sageTeal}
                    onBlur={(e) => e.target.style.borderColor = primaryBrand.softSage}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: primaryBrand.warmEarth,
                    marginBottom: '0.5rem'
                  }}>
                    Family Login ID
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <HelpCircle
                        size={16}
                        style={{ cursor: 'pointer', opacity: 0.7 }}
                        onMouseEnter={() => setShowLoginNameTooltip(true)}
                        onMouseLeave={() => setShowLoginNameTooltip(false)}
                      />
                      {showLoginNameTooltip && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: primaryBrand.warmEarth,
                          color: 'white',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          width: '280px',
                          zIndex: 10,
                          marginBottom: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          <strong>Unique Login ID</strong>
                          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
                            Your family members will use this to log in to their dashboards. Must be unique.
                          </p>
                          <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '0.8rem' }}>
                            Traditional: smith-family, the-johnsons
                          </p>
                          <p style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.8rem' }}>
                            Creative: mom&dad, pizza_party!, chaos&co, adventure_squad!
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.familyLoginName}
                      onChange={(e) => handleLoginNameChange(e.target.value)}
                      placeholder="e.g., smith-family or mom&dad"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        paddingRight: '2.5rem',
                        fontSize: '1rem',
                        border: `2px solid ${
                          loginNameStatus.available === true ? primaryBrand.sageTeal :
                          loginNameStatus.available === false ? colorPalette.red.medium :
                          primaryBrand.softSage
                        }`,
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = primaryBrand.sageTeal}
                      onBlur={(e) => e.target.style.borderColor =
                        loginNameStatus.available === true ? primaryBrand.sageTeal :
                        loginNameStatus.available === false ? colorPalette.red.medium :
                        primaryBrand.softSage
                      }
                    />
                    <div style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      {loginNameStatus.checking && (
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} color={primaryBrand.sageTeal} />
                      )}
                      {!loginNameStatus.checking && loginNameStatus.available === true && (
                        <CheckCircle size={18} color={primaryBrand.sageTeal} />
                      )}
                      {!loginNameStatus.checking && loginNameStatus.available === false && (
                        <XCircle size={18} color={colorPalette.red.medium} />
                      )}
                    </div>
                  </div>
                  {loginNameStatus.error && (
                    <p style={{ color: colorPalette.red.medium, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {loginNameStatus.error}
                    </p>
                  )}
                  {!loginNameStatus.checking && loginNameStatus.available === true && (
                    <p style={{ color: primaryBrand.sageTeal, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      ✓ Available!
                    </p>
                  )}
                  {!loginNameStatus.checking && loginNameStatus.available === false && !loginNameStatus.error && (
                    <p style={{ color: colorPalette.red.medium, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      This login ID is already taken
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: colorPalette.brown.dark
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      required
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer'
                      }}
                    />
                    <span>
                      I understand that as a Founding Family member, I'll receive free access during beta,
                      then a 14-day trial followed by automatic enrollment at the exclusive Founding Family
                      rate with a permanent discount.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: primaryBrand.sageTeal,
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = primaryBrand.deepOcean)}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = primaryBrand.sageTeal)}
                >
                  {loading ? 'Creating Account...' : 'Join Beta FREE'}
                </button>
              </form>

              <p style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: colorPalette.brown.medium
              }}>
                Already have an account?{' '}
                <a
                  href="/login"
                  style={{
                    color: primaryBrand.sageTeal,
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
};

export default BetaSignup;
