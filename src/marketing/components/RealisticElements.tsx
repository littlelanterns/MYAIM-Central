import React from 'react';

// Realistic notebook spiral edge
export const NotebookSpiral: React.FC<{
  height?: number;
  style?: React.CSSProperties;
}> = ({ height = 400, style }) => {
  const numHoles = Math.floor(height / 30);

  return (
    <svg
      width="40"
      height={height}
      style={style}
      viewBox={`0 0 40 ${height}`}
    >
      {/* Paper edge with slight tear texture */}
      <path
        d={`M 0,0 L 8,0 L 10,2 L 9,5 L 11,8 L 9,12 L 10,15 L 8,20 L 10,25 L 9,30 L 8,${height} L 0,${height} Z`}
        fill="var(--background-color)"
        stroke="var(--accent-color)"
        strokeWidth="0.5"
        opacity="0.7"
      />

      {/* Spiral holes */}
      {Array.from({ length: numHoles }).map((_, i) => {
        const y = i * 30 + 15;
        return (
          <g key={i}>
            {/* Hole shadow */}
            <ellipse
              cx="20"
              cy={y + 1}
              rx="6"
              ry="8"
              fill="rgba(0,0,0,0.15)"
            />
            {/* Hole */}
            <ellipse
              cx="20"
              cy={y}
              rx="6"
              ry="8"
              fill="white"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
            {/* Hole inner shadow */}
            <ellipse
              cx="20"
              cy={y - 1}
              rx="4"
              ry="6"
              fill="rgba(0,0,0,0.1)"
            />
          </g>
        );
      })}
    </svg>
  );
};

// Realistic paper clip
export const PaperClip: React.FC<{
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ rotation = 0, color = '#C0C0C0', style }) => {
  return (
    <svg
      width="60"
      height="80"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
        ...style
      }}
      viewBox="0 0 60 80"
    >
      {/* Paper clip wire path with realistic metal shading */}
      <defs>
        <linearGradient id={`clip-gradient-${rotation}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="30%" stopColor={color} stopOpacity="1" />
          <stop offset="70%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id={`clip-shine-${rotation}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Main clip body - outer loop */}
      <path
        d="M 15,10 Q 10,10 10,15 L 10,55 Q 10,65 20,65 L 40,65 Q 50,65 50,55 L 50,25 Q 50,20 45,20"
        fill="none"
        stroke={`url(#clip-gradient-${rotation})`}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Inner loop */}
      <path
        d="M 20,15 L 20,50 Q 20,58 28,58 L 40,58 Q 45,58 45,53 L 45,30"
        fill="none"
        stroke={`url(#clip-gradient-${rotation})`}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Shine highlight */}
      <path
        d="M 16,12 Q 12,12 12,16 L 12,54 Q 12,63 20,63"
        fill="none"
        stroke={`url(#clip-shine-${rotation})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Realistic thumbtack/pushpin
export const Thumbtack: React.FC<{
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ rotation = 0, color = '#E74C3C', style }) => {
  return (
    <svg
      width="50"
      height="60"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.4))',
        ...style
      }}
      viewBox="0 0 50 60"
    >
      <defs>
        {/* Gradient for plastic head */}
        <radialGradient id={`tack-gradient-${rotation}`}>
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>

        {/* Gradient for metal pin */}
        <linearGradient id={`pin-gradient-${rotation}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#CCCCCC" />
          <stop offset="50%" stopColor="#999999" />
          <stop offset="100%" stopColor="#666666" />
        </linearGradient>
      </defs>

      {/* Metal pin */}
      <path
        d="M 24,28 L 24,55 Q 24,58 25,58 Q 26,58 26,55 L 26,28 Z"
        fill={`url(#pin-gradient-${rotation})`}
        stroke="#555555"
        strokeWidth="0.5"
      />

      {/* Pin tip shadow */}
      <ellipse
        cx="25"
        cy="58"
        rx="3"
        ry="1"
        fill="rgba(0,0,0,0.5)"
        opacity="0.6"
      />

      {/* Plastic head - main body */}
      <ellipse
        cx="25"
        cy="15"
        rx="18"
        ry="15"
        fill={`url(#tack-gradient-${rotation})`}
      />

      {/* Top highlight */}
      <ellipse
        cx="20"
        cy="10"
        rx="8"
        ry="6"
        fill="white"
        opacity="0.5"
      />

      {/* Bottom darker edge */}
      <ellipse
        cx="25"
        cy="24"
        rx="18"
        ry="6"
        fill="rgba(0,0,0,0.2)"
      />

      {/* Metal collar where pin meets head */}
      <ellipse
        cx="25"
        cy="28"
        rx="5"
        ry="2"
        fill="#888888"
        stroke="#666666"
        strokeWidth="0.5"
      />
    </svg>
  );
};

// Hand-drawn crayon doodle star
export const CrayonStar: React.FC<{
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ rotation = 0, color = '#FFD700', style }) => {
  return (
    <svg
      width="60"
      height="60"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
      viewBox="0 0 60 60"
    >
      {/* Wobbly hand-drawn star */}
      <path
        d="M 30,5 L 32,22 L 33,23 L 50,23 L 51,25 L 38,35 L 37,36 L 43,52 L 42,54 L 30,43 L 28,42 L 18,54 L 17,52 L 23,36 L 22,35 L 9,25 L 10,23 L 27,23 L 28,22 Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.7"
        style={{
          filter: 'url(#crayon-texture)'
        }}
      />

      <defs>
        <filter id="crayon-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
        </filter>
      </defs>
    </svg>
  );
};

// Hand-drawn crayon scribble circle
export const CrayonCircle: React.FC<{
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ rotation = 0, color = '#FF6B6B', style }) => {
  return (
    <svg
      width="80"
      height="80"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
      viewBox="0 0 80 80"
    >
      {/* Wobbly hand-drawn circle */}
      <path
        d="M 40,10 Q 52,12 60,20 Q 68,28 70,40 Q 68,52 60,60 Q 52,68 40,70 Q 28,68 20,60 Q 12,52 10,40 Q 12,28 20,20 Q 28,12 40,10"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
        style={{
          filter: 'url(#crayon-texture-circle)'
        }}
      />

      <defs>
        <filter id="crayon-texture-circle">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
    </svg>
  );
};

// Hand-drawn crayon arrow
export const CrayonArrow: React.FC<{
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ rotation = 0, color = '#4ECDC4', style }) => {
  return (
    <svg
      width="100"
      height="40"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style
      }}
      viewBox="0 0 100 40"
    >
      {/* Wobbly hand-drawn arrow */}
      <path
        d="M 5,20 L 75,20 M 65,10 L 75,20 L 65,30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
        style={{
          filter: 'url(#crayon-texture-arrow)'
        }}
      />

      <defs>
        <filter id="crayon-texture-arrow">
          <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>
    </svg>
  );
};
