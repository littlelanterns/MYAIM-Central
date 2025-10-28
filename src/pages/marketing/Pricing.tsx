import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { primaryBrand, colorPalette } from '../../styles/colors';
import { PRICING_TIERS, getDiscountPercentage } from '../../lib/pricingConstants';

const Pricing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tiers = [
    {
      key: 'essential',
      ...PRICING_TIERS.essential,
      popular: false,
      cta: 'Start Essential'
    },
    {
      key: 'enhanced',
      ...PRICING_TIERS.enhanced,
      popular: false,
      cta: 'Start Enhanced'
    },
    {
      key: 'fullMagic',
      ...PRICING_TIERS.fullMagic,
      popular: true,
      cta: 'Start Full Magic'
    },
    {
      key: 'creator',
      ...PRICING_TIERS.creator,
      popular: false,
      cta: 'Start Creator'
    }
  ];

  const faqs = [
    {
      q: 'What\'s this Founding Family thing?',
      a: 'Show up early (in your yoga pants with marker on your hands—we get it), be one of the first 100 families, and we lock your pricing in forever. 15-20% off, permanent. As long as you stay subscribed, that rate never changes. It\'s our way of saying "thanks for believing in us when we were still figuring out which kid drew on the wall."'
    },
    {
      q: 'Can I cancel if this isn\'t my jam?',
      a: 'Absolutely. Month-to-month, no contracts, no judgment. Cancel anytime from your settings. (But heads up: if you\'re a Founding Family and cancel, you lose that locked rate. So maybe just downgrade to Essential instead?)'
    },
    {
      q: 'Does this work with ChatGPT, Claude, all those AI things?',
      a: 'YES. All of them. ChatGPT, Claude, Gemini, even the image ones like Midjourney and DALL-E. We\'re platform-agnostic, which is fancy talk for "works everywhere." Build your family context once, use it with whatever AI you like.'
    },
    {
      q: 'Is there a free trial? (Please say yes.)',
      a: 'YES. 14 days, full Enhanced tier access, no credit card required. Try it, love it, then decide. We\'re confident you\'ll stay.'
    },
    {
      q: 'Why not just use ChatGPT by itself?',
      a: 'Because "ChatGPT, help me meal plan" gets you generic recipes. "ChatGPT + AIMfM context about Jake\'s soccer schedule, Emma\'s gluten thing, and the fact that you forgot to defrost chicken" gets you REAL help. We organize your life once, then amplify every AI you use.'
    },
    {
      q: 'Can multiple family members use one account?',
      a: 'Sort of! At Enhanced level and above, all your family members can have their own personal dashboards and personal logins. However, the AI tools (Library, Context Archives, Inner Oracle, etc.) are currently just for mom. We\'re building toward permission-based family access in the future, but for now, it\'s about giving YOU the superpowers to manage family life.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor. PayPal support coming soon!'
    },
    {
      q: 'Do you offer refunds?',
      a: 'Because this is a digital product, we don\'t offer refunds once you\'ve purchased. However, you can cancel your subscription at any time—no contracts, no penalties. We recommend taking advantage of the 14-day free trial to make sure it\'s the right fit before subscribing!'
    }
  ];

  const comparisonFeatures = [
    { feature: 'Context Organization', aimfm: true, chatgpt: false, notion: true, other: false },
    { feature: 'AI Prompt Optimization', aimfm: true, chatgpt: false, notion: false, other: false },
    { feature: 'Platform Agnostic', aimfm: true, chatgpt: false, notion: false, other: false },
    { feature: 'Family-Specific', aimfm: true, chatgpt: false, notion: false, other: false },
    { feature: 'Best Intentions System', aimfm: true, chatgpt: false, notion: false, other: false },
    { feature: 'Educational Tutorials', aimfm: true, chatgpt: false, notion: false, other: true }
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.sageTeal}, ${primaryBrand.deepOcean})`,
        padding: '4rem 2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '1rem'
          }}>
            Pick Your Magic Level
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            marginBottom: '1.5rem'
          }}>
            No tricks, no fine print. Just pick what works for your chaos level today—change it anytime.
          </p>
          <div style={{
            background: primaryBrand.goldenHoney,
            color: primaryBrand.warmEarth,
            padding: '1rem 2rem',
            borderRadius: '8px',
            display: 'inline-block',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            First 100 Founding Families get this pricing locked FOREVER
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1300px',
        margin: '-3rem auto 0',
        position: 'relative'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {tiers.map(tier => (
            <div
              key={tier.name}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: tier.popular
                  ? '0 12px 32px rgba(0,0,0,0.2)'
                  : '0 4px 12px rgba(0,0,0,0.1)',
                border: tier.popular
                  ? `3px solid ${primaryBrand.goldenHoney}`
                  : `1px solid ${primaryBrand.softSage}`,
                position: 'relative',
                transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: primaryBrand.goldenHoney,
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
              )}

              <h3 style={{
                fontSize: '1.8rem',
                color: primaryBrand.warmEarth,
                marginBottom: '0.5rem'
              }}>
                {tier.name}
              </h3>

              <p style={{
                fontSize: '0.95rem',
                color: colorPalette.brown.medium,
                marginBottom: '1.5rem',
                minHeight: '3rem'
              }}>
                {tier.description}
              </p>

              {/* Founding Family Price */}
              <div style={{
                background: primaryBrand.goldenHoney,
                color: primaryBrand.warmEarth,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={16} />
                Founding Family: ${tier.foundingFamilyPrice}
              </div>

              {/* Regular Price */}
              <div style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                color: primaryBrand.sageTeal,
                marginBottom: '0.25rem'
              }}>
                ${tier.regularPrice}
              </div>

              <div style={{
                fontSize: '0.9rem',
                color: colorPalette.brown.medium,
                marginBottom: '0.5rem'
              }}>
                per month
              </div>

              <div style={{
                fontSize: '0.85rem',
                color: colorPalette.brown.medium,
                fontStyle: 'italic',
                marginBottom: '1.5rem'
              }}>
                Save {getDiscountPercentage(tier.key)}% as Founding Family
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '2rem'
              }}>
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.95rem',
                      color: colorPalette.brown.dark
                    }}
                  >
                    <Check size={20} color={primaryBrand.sageTeal} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/beta-signup"
                style={{
                  display: 'block',
                  background: tier.popular
                    ? primaryBrand.sageTeal
                    : 'white',
                  color: tier.popular
                    ? 'white'
                    : primaryBrand.sageTeal,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  border: `2px solid ${primaryBrand.sageTeal}`,
                  transition: 'all 0.2s'
                }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        background: primaryBrand.softSage,
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: primaryBrand.warmEarth,
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          How We Compare
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: primaryBrand.warmEarth, color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>AIM for Moms</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>ChatGPT</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Notion AI</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Others</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${primaryBrand.softSage}`
                  }}
                >
                  <td style={{ padding: '1rem' }}>{row.feature}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {row.aimfm ? <Check size={24} color={primaryBrand.sageTeal} /> : '—'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {row.chatgpt ? <Check size={24} color={primaryBrand.sageTeal} /> : '—'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {row.notion ? <Check size={24} color={primaryBrand.sageTeal} /> : '—'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {row.other ? <Check size={24} color={primaryBrand.sageTeal} /> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: primaryBrand.warmEarth,
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                border: `1px solid ${primaryBrand.softSage}`,
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: primaryBrand.warmEarth,
                  textAlign: 'left'
                }}
              >
                {faq.q}
                {openFaq === idx ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
              {openFaq === idx && (
                <div style={{
                  padding: '0 1.25rem 1.25rem',
                  color: colorPalette.brown.medium,
                  lineHeight: 1.7
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: `linear-gradient(135deg, ${primaryBrand.goldenHoney}, ${primaryBrand.dustyRose})`,
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: primaryBrand.warmEarth,
            marginBottom: '1rem'
          }}>
            Still Not Sure? Try It Free.
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: primaryBrand.warmEarth,
            marginBottom: '2rem'
          }}>
            14 days, full access, no credit card. Because we\'re moms too and we hate those "free trials" that aren\'t actually free.
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
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
