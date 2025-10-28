import React from 'react';
import { Link } from 'react-router-dom';
import { primaryBrand } from '../../styles/colors';

const MarketingFooter: React.FC = () => {
  const footerLinks = {
    product: [
      { label: 'Features', path: '/' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Beta Signup', path: '/beta-signup' },
      { label: 'Login', path: '/login' }
    ],
    resources: [
      { label: 'Strategies & Snippets', path: '/articles' },
      { label: 'About Us', path: '/about' },
      { label: 'Support', path: '/support' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' }
    ],
    connect: [
      { label: 'Facebook', path: 'https://facebook.com', external: true },
      { label: 'Instagram', path: 'https://instagram.com', external: true },
      { label: 'Twitter', path: 'https://twitter.com', external: true }
    ]
  };

  return (
    <footer style={{
      background: primaryBrand.warmEarth,
      color: primaryBrand.warmCream,
      padding: '3rem 2rem 1rem',
      marginTop: '4rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Four Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Product Column */}
          <div>
            <h4 style={{
              color: primaryBrand.goldenHoney,
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.product.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    color: primaryBrand.warmCream,
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryBrand.softGold}
                  onMouseLeave={(e) => e.currentTarget.style.color = primaryBrand.warmCream}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <h4 style={{
              color: primaryBrand.goldenHoney,
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.resources.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    color: primaryBrand.warmCream,
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryBrand.softGold}
                  onMouseLeave={(e) => e.currentTarget.style.color = primaryBrand.warmCream}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h4 style={{
              color: primaryBrand.goldenHoney,
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Legal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.legal.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    color: primaryBrand.warmCream,
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryBrand.softGold}
                  onMouseLeave={(e) => e.currentTarget.style.color = primaryBrand.warmCream}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Column */}
          <div>
            <h4 style={{
              color: primaryBrand.goldenHoney,
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Connect
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.connect.map(link => (
                link.external ? (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: primaryBrand.warmCream,
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryBrand.softGold}
                    onMouseLeave={(e) => e.currentTarget.style.color = primaryBrand.warmCream}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    style={{
                      color: primaryBrand.warmCream,
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = primaryBrand.softGold}
                    onMouseLeave={(e) => e.currentTarget.style.color = primaryBrand.warmCream}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${primaryBrand.dustyRose}`,
          paddingTop: '1.5rem',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: primaryBrand.softSage
        }}>
          <p style={{ margin: '0.5rem 0' }}>
            © {new Date().getFullYear()} AI Magic for Moms. All rights reserved.
          </p>
          <p style={{
            margin: '0.5rem 0',
            fontStyle: 'italic',
            color: primaryBrand.goldenHoney
          }}>
            "Your skills. Your talents. Your interests. Amplified."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
