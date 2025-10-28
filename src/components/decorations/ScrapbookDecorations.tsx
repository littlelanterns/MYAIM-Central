import React, { CSSProperties } from 'react';

// ============================================================================
// DECORATION COMPONENTS - Use these throughout the app for scrapbook aesthetic
// ============================================================================

interface DecorationProps {
  style?: CSSProperties;
  className?: string;
  size?: number | string;
  rotation?: number;
}

// ----------------------------------------------------------------------------
// NOTEBOOK SPIRAL - Perfect for top/left edges of containers
// ----------------------------------------------------------------------------
export const NotebookSpiral: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = '100%',
  rotation = 0
}) => (
  <img
    src="/assets/decorations/notebookspiral.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// CLIPBOARD CLIP - Great for top of cards/sections
// ----------------------------------------------------------------------------
export const ClipboardClip: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 80,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/clipboardclip.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// STAR EMBELLISHMENT - Decorative compass star
// ----------------------------------------------------------------------------
export const StarEmbellishment: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 100,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/decorativepaperstarembellishment.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// GOLD SWIRL ARROW - Hand-drawn arrow for pointing/emphasis
// ----------------------------------------------------------------------------
export const SwirlArrow: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 120,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/goldswirlarrow.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// LINED RIPPED TAPE - Notebook paper with washi tape
// ----------------------------------------------------------------------------
export const LinedPaperTape: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 200,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/linedrippedtape.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// GRAPH PAPER RIPPED - Ripped graph paper texture
// ----------------------------------------------------------------------------
export const GraphPaper: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 300,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/graphpaperripped.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// POLAROID FRAME - Photo frame for images
// ----------------------------------------------------------------------------
export const PolaroidFrame: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 300,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/polaroidframe.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// STAR CLUSTER - Crayon-drawn stars
// ----------------------------------------------------------------------------
export const StarCluster: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 150,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/starcluster.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// SITTING LILA - Adorable AI mascot
// ----------------------------------------------------------------------------
export const SittingLila: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 200,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/sittinglila.png"
    alt="LiLa AI Assistant"
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// REALISTIC THUMBTACKS - Perfect for pinning cards
// ----------------------------------------------------------------------------
export const GoldThumbtack: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 50,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/goldthumbtack.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

export const TealThumbtack: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 50,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/tealthumbtackwithshadow.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

export const PinkThumbtack: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 50,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/blushpinkthumbtack.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// PAPER CLIP - Realistic gold paper clip
// ----------------------------------------------------------------------------
export const PaperClip: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 60,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/goldpaperclip.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// CRAYON STAR - Single hand-drawn star
// ----------------------------------------------------------------------------
export const CrayonStar: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 60,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/singlecrayonstar.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ----------------------------------------------------------------------------
// WASHI TAPE - Sage green washi tape strip
// ----------------------------------------------------------------------------
export const WashiTape: React.FC<DecorationProps> = ({
  style = {},
  className = '',
  size = 200,
  rotation = 0
}) => (
  <img
    src="/assets/decorations/sagegreenwashi.png"
    alt=""
    className={className}
    style={{
      width: typeof size === 'number' ? `${size}px` : size,
      height: 'auto',
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }}
  />
);

// ============================================================================
// COMPOSED DECORATIONS - Pre-styled combinations for common use cases
// ============================================================================

interface CardDecorProps {
  children: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  decorationType?: 'clip' | 'spiral' | 'tape' | 'star';
  rotation?: number;
}

// ----------------------------------------------------------------------------
// DECORATED CARD - Card with decoration on top
// ----------------------------------------------------------------------------
export const DecoratedCard: React.FC<CardDecorProps> = ({
  children,
  style = {},
  className = '',
  decorationType = 'clip',
  rotation = 0
}) => {
  const decorations = {
    clip: <ClipboardClip size={60} rotation={rotation} style={{ position: 'absolute', top: -20, left: '50%', transform: `translateX(-50%) rotate(${rotation}deg)`, zIndex: 10 }} />,
    spiral: <NotebookSpiral size={60} rotation={90} style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 'auto' }} />,
    tape: <LinedPaperTape size={150} rotation={rotation} style={{ position: 'absolute', top: -10, right: -10, zIndex: 10 }} />,
    star: <StarEmbellishment size={80} rotation={rotation} style={{ position: 'absolute', top: -20, right: -20, zIndex: 10 }} />
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {decorations[decorationType]}
      {children}
    </div>
  );
};

// ----------------------------------------------------------------------------
// CORNER DECORATION - Decorative element in corner
// ----------------------------------------------------------------------------
interface CornerDecorationProps {
  type: 'star' | 'starburst' | 'arrow';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  style?: CSSProperties;
}

export const CornerDecoration: React.FC<CornerDecorationProps> = ({
  type,
  corner,
  size = 80,
  style = {}
}) => {
  const positions: Record<typeof corner, CSSProperties> = {
    'top-left': { position: 'absolute', top: -10, left: -10 },
    'top-right': { position: 'absolute', top: -10, right: -10 },
    'bottom-left': { position: 'absolute', bottom: -10, left: -10 },
    'bottom-right': { position: 'absolute', bottom: -10, right: -10 }
  };

  const rotations: Record<typeof corner, number> = {
    'top-left': 0,
    'top-right': 90,
    'bottom-left': -90,
    'bottom-right': 180
  };

  const components = {
    star: <StarCluster size={size} rotation={rotations[corner]} style={{ ...positions[corner], ...style }} />,
    starburst: <StarEmbellishment size={size} rotation={rotations[corner]} style={{ ...positions[corner], ...style }} />,
    arrow: <SwirlArrow size={size} rotation={rotations[corner]} style={{ ...positions[corner], ...style }} />
  };

  return components[type];
};

// ----------------------------------------------------------------------------
// SCRAPBOOK SECTION - Full section with scrapbook aesthetic
// ----------------------------------------------------------------------------
interface ScrapbookSectionProps {
  children: React.ReactNode;
  title?: string;
  background?: 'lined' | 'graph' | 'plain';
  decorations?: ('clip' | 'spiral' | 'stars' | 'lila')[];
  style?: CSSProperties;
  className?: string;
}

export const ScrapbookSection: React.FC<ScrapbookSectionProps> = ({
  children,
  title,
  background = 'plain',
  decorations = ['clip'],
  style = {},
  className = ''
}) => {
  const backgrounds: Record<typeof background, string> = {
    lined: "url('/assets/decorations/linedrippedtape.png')",
    graph: "url('/assets/decorations/graphpaperripped.png')",
    plain: 'var(--background-color)'
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        padding: '3rem 2rem',
        background: backgrounds[background],
        backgroundSize: background !== 'plain' ? 'cover' : 'auto',
        backgroundPosition: 'center',
        ...style
      }}
    >
      {/* Title with decoration */}
      {title && (
        <div style={{ position: 'relative', marginBottom: '2rem', textAlign: 'center' }}>
          {decorations.includes('clip') && (
            <ClipboardClip
              size={80}
              style={{
                position: 'absolute',
                top: -40,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
          )}
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            margin: 0
          }}>
            {title}
          </h2>
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Decorative elements */}
      {decorations.includes('spiral') && (
        <NotebookSpiral
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: 'auto'
          }}
        />
      )}

      {decorations.includes('stars') && (
        <>
          <StarCluster
            size={100}
            rotation={15}
            style={{ position: 'absolute', top: '10%', right: '5%', opacity: 0.7 }}
          />
          <StarCluster
            size={80}
            rotation={-25}
            style={{ position: 'absolute', bottom: '15%', left: '8%', opacity: 0.6 }}
          />
        </>
      )}

      {decorations.includes('lila') && (
        <SittingLila
          size={150}
          style={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.9 }}
        />
      )}
    </div>
  );
};

export default {
  NotebookSpiral,
  ClipboardClip,
  StarEmbellishment,
  SwirlArrow,
  LinedPaperTape,
  GraphPaper,
  PolaroidFrame,
  StarCluster,
  SittingLila,
  GoldThumbtack,
  TealThumbtack,
  PinkThumbtack,
  PaperClip,
  CrayonStar,
  WashiTape,
  DecoratedCard,
  CornerDecoration,
  ScrapbookSection
};
