import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Lightbulb, Target, Sparkles, Clock, Shield } from 'lucide-react';
import { primaryBrand, colorPalette } from '../../styles/colors';
import {
  GoldThumbtack,
  TealThumbtack,
  PinkThumbtack,
  CrayonStar,
  SittingLila
} from '../../components/decorations/ScrapbookDecorations';

const Home: React.FC = () => {
  // Hardcoded testimonials for now
  const testimonials = [
    {
      id: 1,
      image: 'https://placehold.co/400x500/d4e3d9/5a4033?text=Happy+Mom',
      text: 'MyAIM-Central completely changed how I manage our family. I went from overwhelmed to organized in just one week!',
      name: 'Sarah M.',
      family: 'Mom of 3, ages 6-12',
      title: 'Life-Changing Tool',
      rotation: -3
    },
    {
      id: 2,
      image: 'https://placehold.co/400x500/f4dcb7/5a4033?text=Busy+Mom',
      text: "I finally have time for my side business. LiLa helps me create content that would've taken hours in just minutes.",
      name: 'Jennifer K.',
      family: 'Mom of 2, entrepreneur',
      title: 'Finally Time for Me',
      rotation: 2
    },
    {
      id: 3,
      image: 'https://placehold.co/400x500/d69a84/fff?text=Working+Mom',
      text: 'The AI prompt optimizer is incredible. My ChatGPT results went from "meh" to "wow" instantly.',
      name: 'Maria L.',
      family: 'Working mom, twins',
      title: 'AI Game-Changer',
      rotation: 4
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Hours Saved', icon: Clock },
    { number: '500+', label: 'Beta Families', icon: Heart },
    { number: '95%', label: 'Satisfaction Rate', icon: Sparkles }
  ];

  const pricingTiers = [
    { name: 'Essential', price: '$9.99', features: ['Core tutorials', 'Basic tools', 'Limited storage'] },
    { name: 'Enhanced', price: '$16.99', features: ['All tutorials', 'Full tools', 'LiLa optimization'] },
    { name: 'Full Magic', price: '$24.99', features: ['Everything', 'Advanced tools', 'Multi-AI panel'], popular: true },
    { name: 'Creator', price: '$39.99', features: ['All features', 'Custom tools', 'Marketplace access'] }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.warmCream} 0%, ${primaryBrand.softGold} 100%)`,
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: primaryBrand.warmEarth,
            marginBottom: '1rem',
            fontFamily: 'The Seasons, serif'
          }}>
            Make Magic with the Mess
          </h1>
          <p style={{
            fontSize: '1.4rem',
            color: primaryBrand.sageTeal,
            marginBottom: '1rem',
            lineHeight: 1.6,
            fontStyle: 'italic'
          }}>
            Real moms. Real mess. Really cool AI.
          </p>
          <p style={{
            fontSize: '1.15rem',
            color: primaryBrand.warmEarth,
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            You do it ALL. We make it all easAIer. Because if you can figure out Common Core math,
            you can definitely figure out AI—especially when it's designed just for moms.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/beta-signup"
              style={{
                background: primaryBrand.sageTeal,
                color: primaryBrand.warmCream,
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
            >
              Join Beta - First 100 Get Special Pricing!
            </Link>
            <Link
              to="/pricing"
              style={{
                background: 'white',
                color: primaryBrand.sageTeal,
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                border: `2px solid ${primaryBrand.sageTeal}`,
                transition: 'transform 0.2s'
              }}
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '2rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1rem'
            }}>
              The Reality
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.7
            }}>
              You're three sips into cold coffee and someone is yelling from the bathroom.
              You've heard AI can help, but between dinner (currently on your pants) and practice
              schedules, who has time to learn another tech thing? Plus, when you do try ChatGPT,
              it's like... okay? But not "worth the hype" okay.
            </p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2rem',
              color: primaryBrand.sageTeal,
              marginBottom: '1rem'
            }}>
              The Magic
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.7
            }}>
              Build your family's context once, use it everywhere. Tell us about your kids' learning styles,
              dietary restrictions, that soccer schedule—and we'll help you turn "ChatGPT, give me dinner ideas"
              into results that actually work for YOUR chaos. No tech degree required. Promise.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        background: primaryBrand.softSage,
        padding: '4rem 2rem'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: primaryBrand.warmEarth,
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            How It Works (No PhD Required)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { step: 1, title: 'Build Context', desc: 'Add family info, values, and goals once' },
              { step: 2, title: 'Choose Your AI', desc: 'Use ChatGPT, Claude, Gemini—whatever you like' },
              { step: 3, title: 'Let LiLa Optimize', desc: 'Get perfectly tailored prompts for any AI' },
              { step: 4, title: 'Get Better Results', desc: 'AI that actually understands your family' }
            ].map(item => (
              <div
                key={item.step}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: primaryBrand.goldenHoney,
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}>
                  {item.step}
                </div>
                <h4 style={{
                  fontSize: '1.3rem',
                  color: primaryBrand.warmEarth,
                  marginBottom: '0.5rem'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  color: colorPalette.brown.medium,
                  lineHeight: 1.6
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: primaryBrand.warmEarth,
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Real Moms. Real Results.
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {testimonials.map((testimonial, index) => {
            const Thumbtack = [GoldThumbtack, TealThumbtack, PinkThumbtack][index % 3];

            return (
            <div
              key={testimonial.id}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              {/* Thumbtack pinning the polaroid */}
              <Thumbtack
                size={50}
                rotation={testimonial.rotation * 2}
                style={{
                  position: 'absolute',
                  top: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />

              {/* Star accent on first testimonial */}
              {index === 0 && (
                <CrayonStar
                  size={50}
                  rotation={25}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    opacity: 0.7,
                    zIndex: 1
                  }}
                />
              )}

              <div
                style={{
                  background: 'white',
                  border: `12px solid ${primaryBrand.warmCream}`,
                  borderRadius: '4px',
                  padding: '1rem',
                  maxWidth: '300px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: `rotate(${testimonial.rotation}deg)`,
                  transition: 'transform 0.3s, boxShadow 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `rotate(0deg) translateY(-8px)`;
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${testimonial.rotation}deg)`;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover',
                  marginBottom: '1rem',
                  borderRadius: '2px'
                }}
              />
              <p style={{
                fontSize: '0.9rem',
                color: primaryBrand.warmEarth,
                marginBottom: '0.5rem',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                "{testimonial.text.substring(0, 100)}..."
              </p>
              <p style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '1.2rem',
                color: primaryBrand.warmEarth,
                textAlign: 'center',
                margin: 0
              }}>
                — {testimonial.name}
              </p>
            </div>
          </div>
          );
          })}

          {/* Add LiLa mascot to testimonials section */}
          <div style={{ position: 'relative', alignSelf: 'center' }}>
            <SittingLila
              size={180}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.sageTeal}, ${primaryBrand.deepOcean})`,
        padding: '3rem 2rem',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {stats.map(stat => (
            <div key={stat.label}>
              <stat.icon size={48} style={{ margin: '0 auto 1rem' }} />
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '1.1rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: primaryBrand.warmEarth,
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '1.1rem',
          color: colorPalette.brown.medium,
          marginBottom: '3rem'
        }}>
          First 100 beta members get permanent locked pricing!
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {pricingTiers.map(tier => (
            <div
              key={tier.name}
              style={{
                background: tier.popular ? primaryBrand.sageTeal : 'white',
                color: tier.popular ? 'white' : primaryBrand.warmEarth,
                border: tier.popular ? 'none' : `2px solid ${primaryBrand.softSage}`,
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
                boxShadow: tier.popular ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: primaryBrand.goldenHoney,
                  padding: '0.25rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
              )}
              <h3 style={{
                fontSize: '1.8rem',
                marginBottom: '0.5rem',
                color: tier.popular ? 'white' : primaryBrand.warmEarth
              }}>
                {tier.name}
              </h3>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: tier.popular ? 'white' : primaryBrand.sageTeal
              }}>
                {tier.price}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>per month</div>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{ padding: '0.5rem 0', fontSize: '0.95rem' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                style={{
                  display: 'block',
                  background: tier.popular ? 'white' : primaryBrand.sageTeal,
                  color: tier.popular ? primaryBrand.sageTeal : 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'transform 0.2s'
                }}
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.dustyRose}, ${primaryBrand.goldenHoney})`,
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: primaryBrand.warmEarth,
            marginBottom: '1rem'
          }}>
            You're the Magic. We're Just the Recipe.
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: primaryBrand.warmEarth,
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Join the first 100 families and lock in founding member pricing forever.
            Because you showed up early, in your yoga pants, with marker on your hands—and we see you.
          </p>
          <Link
            to="/beta-signup"
            style={{
              display: 'inline-block',
              background: primaryBrand.warmEarth,
              color: primaryBrand.warmCream,
              padding: '1.25rem 3rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Claim Your Spot Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
