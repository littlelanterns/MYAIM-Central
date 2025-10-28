import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { primaryBrand, colorPalette } from '../../styles/colors';

const About: React.FC = () => {
  return (
    <div style={{ width: '100%' }}>
      {/* Hero / Intro */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.warmCream}, ${primaryBrand.softGold})`,
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: primaryBrand.warmEarth,
            marginBottom: '1rem',
            fontFamily: 'The Seasons, serif'
          }}>
            Built by a Mom, For Moms
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: primaryBrand.sageTeal,
            lineHeight: 1.6
          }}>
            Because we're done pretending it's all easy.
          </p>
        </div>
      </section>

      {/* Story Section 1 - From Overwhelmed to Empowered */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <img
              src="https://placehold.co/600x400/d4e3d9/5a4033?text=Stage+Moment"
              alt="From overwhelmed to empowered"
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <div>
            <h2 style={{
              fontSize: '2.5rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1rem'
            }}>
              From Overwhelmed to Empowered
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              Hey! I'm a mom who… Wait, are they seriously putting hairchalk on the goat?!?! … umm.. BRB.
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              …okay, where was I? Right—I'm a mom who thinks AI is freaking awesome. And if motherhood
              really IS the most important job (blah blah, we know), then why aren't there AI tools designed
              specifically for us?
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8
            }}>
              I tried all the "AI for families" tools. They were either dumbed-down ChatGPT wrappers or
              overcomplicated systems that required a PhD to use. They did not cooperate when I wanted to
              "color outside the lines"—and even when they added AI, it wasn't doing what I wished it would do.
              So I (with AI) set out to create something that would.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section 2 - Building What Moms Actually Need */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: primaryBrand.softSage,
        borderRadius: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div style={{ order: window.innerWidth > 768 ? 1 : 2 }}>
            <h2 style={{
              fontSize: '2.5rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1rem'
            }}>
              Building What Moms Actually Need
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              When I say "meal planning," I don't mean "what's for dinner." I mean juggling 9 different food
              preferences, 3 dietary restrictions, who has practice when, what's on sale, what's actually in my
              fridge, and somehow making it nutritious while keeping everyone happy.
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              Generic AI gives me: "Here are 5 dinner ideas!" What I actually need: "Based on your family's
              preferences, Jake's soccer practice schedule, and the fact that you forgot to defrost anything,
              here are 3 realistic options using what's in your pantry, plus a backup plan for when someone
              inevitably melts down about dinner."
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8
            }}>
              That's what MyAIM-Central does. You build your family's context once, and our AI actually gets
              your genius and amplifies it. Because if we can figure out Common Core math, we can definitely
              figure out AI.
            </p>
          </div>
          <div style={{ order: window.innerWidth > 768 ? 2 : 1 }}>
            <img
              src="https://placehold.co/600x400/f4dcb7/5a4033?text=Workspace"
              alt="Building what moms need"
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Story Section 3 - Sharing the Magic */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <img
              src="https://placehold.co/600x400/d69a84/fff?text=Teaching"
              alt="Sharing the magic"
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <div>
            <h2 style={{
              fontSize: '2.5rem',
              color: primaryBrand.warmEarth,
              marginBottom: '1rem'
            }}>
              Sharing the Magic
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              When I showed MyAIM-Central to other moms, their reactions were immediate: "Wait, this is
              what I've been looking for!"
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8,
              marginBottom: '1rem'
            }}>
              They weren't excited about another AI tool. They were excited about having their time back.
              About finally feeling organized. About using AI without feeling like they needed a computer
              science degree.
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: colorPalette.brown.dark,
              lineHeight: 1.8
            }}>
              That's when I knew this needed to be more than just my personal tool. It needed to be a
              movement. Because every mom deserves to amplify her brilliance without burning out in the process.
            </p>
          </div>
        </div>
      </section>

      {/* Meet LiLa Section */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.sageTeal}, ${primaryBrand.deepOcean})`,
        padding: '4rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            width: '200px',
            height: '200px',
            background: primaryBrand.goldenHoney,
            borderRadius: '50%',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6rem'
          }}>
            <Sparkles size={100} />
          </div>
          <h2 style={{
            fontSize: '3rem',
            marginBottom: '1.5rem',
            fontFamily: 'The Seasons, serif'
          }}>
            Meet LiLa
          </h2>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: 1.8,
            marginBottom: '1rem',
            opacity: 0.95
          }}>
            LiLa is your AI assistant who actually gets it. She knows your kids' names, remembers their
            learning styles, understands your family's values, and optimizes every AI prompt to get you
            better results.
          </p>
          <p style={{
            fontSize: '1.3rem',
            lineHeight: 1.8,
            opacity: 0.95
          }}>
            She's not here to replace you—she's here to amplify what you already do brilliantly.
            Think of her as your behind-the-scenes AI translator, turning your quick thoughts into
            powerful, context-rich prompts for any AI platform.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          background: primaryBrand.warmCream,
          padding: '3rem',
          borderRadius: '24px',
          border: `4px solid ${primaryBrand.dustyRose}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          <Heart
            size={60}
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: primaryBrand.dustyRose,
              fill: primaryBrand.dustyRose
            }}
          />
          <blockquote style={{
            fontSize: '2rem',
            fontStyle: 'italic',
            color: primaryBrand.warmEarth,
            lineHeight: 1.6,
            margin: '2rem 0',
            fontFamily: 'The Seasons, serif'
          }}>
            "You're the magic. I'm just here with a recipe and some really good AI."
          </blockquote>
          <p style={{
            fontSize: '1.2rem',
            color: colorPalette.brown.medium,
            lineHeight: 1.7,
            marginBottom: '1rem'
          }}>
            AI doesn't handle the important stuff—that's where YOUR brilliance shines. But it makes everything
            else easier, faster, and way more fun.
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: colorPalette.brown.medium,
            lineHeight: 1.7,
            fontStyle: 'italic'
          }}>
            Built with love, caffeine, and whatever my kids wiped on my pants today.
          </p>
        </div>
      </section>

      {/* Final CTA */}
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
            Ready to Join the Movement?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: primaryBrand.warmEarth,
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            Be part of the first 100 Founding Families and help shape the future of AI for moms.
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
            Join Beta FREE
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
