import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import { primaryBrand, colorPalette } from '../../styles/colors';
import { createBetaAccount, getFoundingFamilyCount } from '../../lib/betaSignupService';

const BetaSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    familyName: '',
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Load current founding family count
    async function loadCount() {
      const count = await getFoundingFamilyCount();
      setSpotsRemaining(100 - count);
    }
    loadCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.familyName) {
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

    setLoading(true);

    try {
      const result = await createBetaAccount({
        email: formData.email,
        password: formData.password,
        familyName: formData.familyName
      });

      if (result.success) {
        // Redirect to forced family setup
        navigate('/beta/family-setup');
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

      {/* Main Content */}
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
                    Family Name
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
    </div>
  );
};

export default BetaSignup;
