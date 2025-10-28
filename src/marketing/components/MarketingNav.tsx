import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Marketing navigation component
const MarketingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Strategies & Snippets', path: '/articles' },
    { label: 'Pricing', path: '/pricing' }
  ];

  return (
    <nav style={{
      background: 'var(--background-color)',
      borderBottom: '1px solid var(--accent-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none'
        }}>
          <img
            src="/aimfm-logo.png"
            alt="AI Magic for Moms"
            style={{
              height: '50px',
              width: 'auto'
            }}
            onError={(e) => {
              // Fallback to text if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.style.fontSize = '1.5rem';
                parent.style.fontWeight = 'bold';
                parent.style.color = 'var(--text-color)';
                parent.style.fontFamily = 'The Seasons, serif';
                parent.textContent = 'AI Magic for Moms';
              }
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: 'var(--text-color)',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-color)'}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
            <Link
              to="/login"
              className="btn-secondary"
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                border: '2px solid var(--primary-color)',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              Login
            </Link>
            <Link
              to="/beta-signup"
              className="btn-primary"
              style={{
                background: 'var(--gradient-primary)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              Join Beta
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-color)'
          }}
          className="mobile-menu-button"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--background-color)',
          borderTop: '1px solid var(--accent-color)',
          padding: '1rem'
        }} className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                color: 'var(--text-color)',
                textDecoration: 'none',
                padding: '0.75rem',
                borderBottom: '1px solid var(--accent-color)'
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary"
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                padding: '0.75rem',
                border: '2px solid var(--primary-color)',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              Login
            </Link>
            <Link
              to="/beta-signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary"
              style={{
                background: 'var(--gradient-primary)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Join Beta
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default MarketingNav;
