// AIMfM Complete Color System
// src/styles/colors.js

// Primary Brand Colors (Core AIMfM palette)
export const primaryBrand = {
  warmCream: '#fff4ec',
  warmEarth: '#5a4033', 
  sageTeal: '#68a395',
  softSage: '#d4e3d9',
  goldenHoney: '#d6a461',
  dustyRose: '#d69a84',
  softGold: '#f4dcb7',
  deepOcean: '#2c5d60'
};

// Extended Color Palette (from your Excel file)
export const colorPalette = {
  red: {
    light: '#f8d6d0',      // Light Blush
    medium: '#f3a6a0',     // Coral Pink  
    dark: '#b25a58',       // Rustic Rose
    deepest: '#8e3e3c'     // Deep Brick
  },
  orange: {
    light: '#fde3c7',      // Soft Apricot
    medium: '#f9c396',     // Peach Nectar
    dark: '#b86432',       // Burnt Sienna
    deepest: '#8a4a25'     // Chestnut Clay
  },
  yellow: {
    lightest: '#fdf4db',   // Champagne Linen
    lighter: '#fff6d5',    // Buttercream
    light: '#f3d188',      // Honey Butter
    medium: '#fae49b',     // Sunbeam Gold
    mediumDark: '#d4b063', // Golden Wheat
    dark: '#b99c34',       // Mustard Grove
    darker: '#8c6b3f',     // Burnished Bronze
    deepest: '#8a7220'     // Ochre Earth
  },
  green: {
    lightest: '#d8e3da',   // Silver Sage
    lighter: '#dcefe3',    // Misty Mint
    light: '#aebfb4',      // Misty Eucalyptus
    medium: '#b2d3c0',     // Herb Garden
    mediumDark: '#889a8d', // Dusty Sage
    dark: '#4b7c66',       // Forest Sage
    darker: '#5e7164',     // Weathered Pine
    deepest: '#355f50'     // Pine Shadow
  },
  teal: {
    light: '#d7eae2',      // Seafoam
    medium: '#a8cfc8',     // Cool Sage
    dark: '#68a395',       // AIMfM Sage Teal (primary)
    deepest: '#2c5d60'     // Deep Ocean
  },
  blue: {
    light: '#c8d1d6',      // Storm Cloud
    medium: '#7d98a5',     // Coastal Blue
    dark: '#4a5f6a',       // Evening Indigo
    deepest: '#2f3e48'     // Inkwell
  },
  purple: {
    light: '#e9daec',      // Lilac Whisper
    medium: '#d2b9d7',     // Mauve Fog
    dark: '#805a82',       // Vintage Plum
    deepest: '#5d3e60'     // Eggplant Night
  },
  brown: {
    light: '#e5d5ca',      // Pale Mocha
    medium: '#c8ad9d',     // Cinnamon Milk
    dark: '#6f4f3a',       // Coffee Bean
    deepest: '#4e3426'     // Dark Walnut
  },
  pink: {
    light: '#fce8e3',      // Petal Blush
    medium: '#f5c1ba',     // Rose Dust
    dark: '#b4716d',       // Muted Berry
    deepest: '#8e4e4a'     // Mulberry Clay
  }
};

// ALL AVAILABLE COLORS for Family Member Assignment (50+ colors)
export const familyMemberColors = [
  // Primary Brand Colors
  { name: 'AIMfM Sage Teal', color: primaryBrand.sageTeal, family: 'brand' },
  { name: 'Golden Honey', color: primaryBrand.goldenHoney, family: 'brand' },
  { name: 'Dusty Rose', color: primaryBrand.dustyRose, family: 'brand' },
  { name: 'Soft Gold', color: primaryBrand.softGold, family: 'brand' },
  { name: 'Soft Sage', color: primaryBrand.softSage, family: 'brand' },
  { name: 'Deep Ocean', color: primaryBrand.deepOcean, family: 'brand' },
  
  // Red Family
  { name: 'Light Blush', color: colorPalette.red.light, family: 'red' },
  { name: 'Coral Pink', color: colorPalette.red.medium, family: 'red' },
  { name: 'Rustic Rose', color: colorPalette.red.dark, family: 'red' },
  { name: 'Deep Brick', color: colorPalette.red.deepest, family: 'red' },
  
  // Orange Family
  { name: 'Soft Apricot', color: colorPalette.orange.light, family: 'orange' },
  { name: 'Peach Nectar', color: colorPalette.orange.medium, family: 'orange' },
  { name: 'Burnt Sienna', color: colorPalette.orange.dark, family: 'orange' },
  { name: 'Chestnut Clay', color: colorPalette.orange.deepest, family: 'orange' },
  
  // Yellow Family (expanded)
  { name: 'Champagne Linen', color: colorPalette.yellow.lightest, family: 'yellow' },
  { name: 'Buttercream', color: colorPalette.yellow.lighter, family: 'yellow' },
  { name: 'Honey Butter', color: colorPalette.yellow.light, family: 'yellow' },
  { name: 'Sunbeam Gold', color: colorPalette.yellow.medium, family: 'yellow' },
  { name: 'Golden Wheat', color: colorPalette.yellow.mediumDark, family: 'yellow' },
  { name: 'Mustard Grove', color: colorPalette.yellow.dark, family: 'yellow' },
  { name: 'Burnished Bronze', color: colorPalette.yellow.darker, family: 'yellow' },
  { name: 'Ochre Earth', color: colorPalette.yellow.deepest, family: 'yellow' },
  
  // Green Family (expanded)
  { name: 'Silver Sage', color: colorPalette.green.lightest, family: 'green' },
  { name: 'Misty Mint', color: colorPalette.green.lighter, family: 'green' },
  { name: 'Misty Eucalyptus', color: colorPalette.green.light, family: 'green' },
  { name: 'Herb Garden', color: colorPalette.green.medium, family: 'green' },
  { name: 'Dusty Sage', color: colorPalette.green.mediumDark, family: 'green' },
  { name: 'Forest Sage', color: colorPalette.green.dark, family: 'green' },
  { name: 'Weathered Pine', color: colorPalette.green.darker, family: 'green' },
  { name: 'Pine Shadow', color: colorPalette.green.deepest, family: 'green' },
  
  // Teal Family
  { name: 'Seafoam', color: colorPalette.teal.light, family: 'teal' },
  { name: 'Cool Sage', color: colorPalette.teal.medium, family: 'teal' },
  { name: 'Deep Ocean Current', color: colorPalette.teal.deepest, family: 'teal' },
  
  // Blue Family (new)
  { name: 'Storm Cloud', color: colorPalette.blue.light, family: 'blue' },
  { name: 'Coastal Blue', color: colorPalette.blue.medium, family: 'blue' },
  { name: 'Evening Indigo', color: colorPalette.blue.dark, family: 'blue' },
  { name: 'Inkwell', color: colorPalette.blue.deepest, family: 'blue' },
  
  // Purple Family (updated)
  { name: 'Lilac Whisper', color: colorPalette.purple.light, family: 'purple' },
  { name: 'Mauve Fog', color: colorPalette.purple.medium, family: 'purple' },
  { name: 'Vintage Plum', color: colorPalette.purple.dark, family: 'purple' },
  { name: 'Eggplant Night', color: colorPalette.purple.deepest, family: 'purple' },
  
  // Brown Family (updated)
  { name: 'Pale Mocha', color: colorPalette.brown.light, family: 'brown' },
  { name: 'Cinnamon Milk', color: colorPalette.brown.medium, family: 'brown' },
  { name: 'Coffee Bean', color: colorPalette.brown.dark, family: 'brown' },
  { name: 'Dark Walnut', color: colorPalette.brown.deepest, family: 'brown' },
  
  // Pink Family (updated)
  { name: 'Petal Blush', color: colorPalette.pink.light, family: 'pink' },
  { name: 'Rose Dust', color: colorPalette.pink.medium, family: 'pink' },
  { name: 'Muted Berry', color: colorPalette.pink.dark, family: 'pink' },
  { name: 'Mulberry Clay', color: colorPalette.pink.deepest, family: 'pink' }
];

// PERSONAL THEMES (what individuals can choose from)
export const personalThemes = {
  classic: {
    name: "Classic AIMfM",
    description: "The original warm and inviting brand colors",
    primary: primaryBrand.sageTeal,
    secondary: primaryBrand.goldenHoney,
    accent: primaryBrand.dustyRose,
    background: primaryBrand.warmCream,
    text: primaryBrand.warmEarth,
    preview: [primaryBrand.sageTeal, primaryBrand.goldenHoney, primaryBrand.dustyRose]
  },
  
  forest: {
    name: "Forest Calm",
    description: "Peaceful greens and earth tones",
    primary: colorPalette.green.dark,
    secondary: colorPalette.green.medium,
    accent: colorPalette.brown.medium,
    background: colorPalette.green.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.green.dark, colorPalette.green.medium, colorPalette.brown.medium]
  },
  
  ocean: {
    name: "Ocean Breeze",
    description: "Cool blues and teals for a refreshing feel",
    primary: colorPalette.teal.dark,
    secondary: colorPalette.teal.medium,
    accent: colorPalette.green.medium,
    background: colorPalette.teal.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.teal.dark, colorPalette.teal.medium, colorPalette.green.medium]
  },
  
  sunset: {
    name: "Warm Sunset",
    description: "Golden oranges and warm yellows",
    primary: colorPalette.orange.dark,
    secondary: colorPalette.yellow.medium,
    accent: colorPalette.red.medium,
    background: colorPalette.orange.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.orange.dark, colorPalette.yellow.medium, colorPalette.red.medium]
  },
  
  lavender: {
    name: "Lavender Dreams",
    description: "Soft purples and gentle pinks",
    primary: colorPalette.purple.dark,
    secondary: colorPalette.purple.medium,
    accent: colorPalette.pink.medium,
    background: colorPalette.purple.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.purple.dark, colorPalette.purple.medium, colorPalette.pink.medium]
  },
  
  earthy: {
    name: "Earthy Comfort",
    description: "Warm browns and natural tones",
    primary: colorPalette.brown.dark,
    secondary: colorPalette.brown.medium,
    accent: colorPalette.orange.medium,
    background: colorPalette.brown.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.brown.dark, colorPalette.brown.medium, colorPalette.orange.medium]
  },
  
  rosegold: {
    name: "Rose Gold",
    description: "Luxurious rose gold jewelry tones",
    primary: colorPalette.pink.medium,        // #d69a84 - Dusty Rose
    secondary: primaryBrand.softGold,         // #f4dcb7 - Soft Gold  
    accent: colorPalette.pink.light,          // #f0e0d8 - Blush Canvas
    background: primaryBrand.warmCream,       // #fff4ec - Warm Cream
    text: primaryBrand.warmEarth,            // #5a4033 - Warm Earth
    preview: [colorPalette.pink.medium, primaryBrand.softGold, colorPalette.pink.light]
  },

  // SEASONAL/HOLIDAY THEMES
  spring: {
    name: "Fresh Spring",
    description: "New growth and fresh beginnings",
    primary: colorPalette.green.medium,
    secondary: colorPalette.yellow.light,
    accent: colorPalette.pink.light,
    background: '#f8fff8',
    text: primaryBrand.warmEarth,
    preview: [colorPalette.green.medium, colorPalette.yellow.light, colorPalette.pink.light],
    seasonal: true
  },
  
  summer: {
    name: "Sunny Summer",
    description: "Bright and cheerful summer vibes",
    primary: colorPalette.yellow.dark,
    secondary: colorPalette.orange.medium,
    accent: colorPalette.teal.medium,
    background: colorPalette.yellow.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.yellow.dark, colorPalette.orange.medium, colorPalette.teal.medium],
    seasonal: true
  },
  
  autumn: {
    name: "Cozy Autumn",
    description: "Warm harvest colors and falling leaves",
    primary: colorPalette.orange.dark,
    secondary: colorPalette.brown.medium,
    accent: colorPalette.red.dark,
    background: colorPalette.orange.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.orange.dark, colorPalette.brown.medium, colorPalette.red.dark],
    seasonal: true
  },
  
  winter: {
    name: "Winter Wonderland",
    description: "Cool and peaceful winter atmosphere",
    primary: colorPalette.purple.dark,
    secondary: colorPalette.teal.dark,
    accent: primaryBrand.softSage,
    background: '#f5f8ff',
    text: primaryBrand.warmEarth,
    preview: [colorPalette.purple.dark, colorPalette.teal.dark, primaryBrand.softSage],
    seasonal: true
  },
  
  christmas: {
    name: "Christmas Joy",
    description: "Classic red and green holiday spirit",
    primary: colorPalette.red.dark,
    secondary: colorPalette.green.dark,
    accent: colorPalette.yellow.medium,
    background: colorPalette.red.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.red.dark, colorPalette.green.dark, colorPalette.yellow.medium],
    holiday: true
  },
  
  fall: {
    name: "Fall Fun",
    description: "Cozy autumn vibes with warm oranges and spice colors",
    primary: colorPalette.orange.dark,
    secondary: colorPalette.purple.dark,
    accent: colorPalette.yellow.dark,
    background: colorPalette.orange.light,
    text: primaryBrand.warmEarth,
    preview: [colorPalette.orange.dark, colorPalette.purple.dark, colorPalette.yellow.dark],
    holiday: true
  },
  
  // MASCULINE/NEUTRAL THEMES
  storm: {
    name: "Storm & Steel",
    description: "Professional focus with tech-forward confidence",
    primary: '#1a365d',      // Dark Navy
    secondary: '#4a5568',    // Slate Gray
    accent: '#e2e8f0',       // Cool Silver
    background: '#f7fafc',   // Light Steel
    text: '#2d3748',         // Charcoal
    preview: ['#1a365d', '#4a5568', '#e2e8f0']
  },
  
  woodland: {
    name: "Woodland Retreat", 
    description: "Grounded and natural with outdoor sophistication",
    primary: '#2f4f2f',      // Charcoal Green
    secondary: '#8b8680',    // Warm Gray
    accent: '#9caf88',       // Moss
    background: '#faf9f7',   // Linen
    text: '#3c3c3c',         // Deep Bark
    preview: ['#2f4f2f', '#8b8680', '#9caf88']
  },

  // CHILD-FRIENDLY THEMES (using your existing color palette)
  brightSunshine: {
    name: "Bright Sunshine",
    description: "Happy and bright like sunshine!",
    primary: colorPalette.yellow.medium,    // Sunbeam Gold
    secondary: colorPalette.orange.light,   // Soft Apricot
    accent: colorPalette.yellow.light,      // Honey Butter
    background: colorPalette.yellow.lightest, // Champagne Linen
    text: primaryBrand.warmEarth,
    preview: [colorPalette.yellow.medium, colorPalette.orange.light, colorPalette.yellow.light],
    childFriendly: true
  },

  oceanWaves: {
    name: "Ocean Waves",
    description: "Cool and calm like ocean waves",
    primary: colorPalette.teal.medium,      // Cool Sage
    secondary: colorPalette.blue.medium,    // Coastal Blue
    accent: colorPalette.teal.light,        // Seafoam
    background: '#f0f8ff',                  // Alice Blue
    text: primaryBrand.warmEarth,
    preview: [colorPalette.teal.medium, colorPalette.blue.medium, colorPalette.teal.light],
    childFriendly: true
  },

  forestAdventure: {
    name: "Forest Adventure",
    description: "Green like nature adventures!",
    primary: colorPalette.green.medium,     // Herb Garden
    secondary: colorPalette.green.light,    // Misty Eucalyptus
    accent: colorPalette.yellow.light,      // Honey Butter
    background: colorPalette.green.lighter, // Misty Mint
    text: primaryBrand.warmEarth,
    preview: [colorPalette.green.medium, colorPalette.green.light, colorPalette.yellow.light],
    childFriendly: true
  },

  prettyFlowers: {
    name: "Pretty Flowers",
    description: "Soft and pretty like spring flowers",
    primary: colorPalette.pink.medium,      // Rose Dust
    secondary: colorPalette.purple.light,   // Lilac Whisper
    accent: colorPalette.pink.light,        // Petal Blush
    background: '#fef7ff',                  // Very Light Pink
    text: primaryBrand.warmEarth,
    preview: [colorPalette.pink.medium, colorPalette.purple.light, colorPalette.pink.light],
    childFriendly: true
  },

  // SEASONAL THEMES (without holiday names)
  winterWonderland: {
    name: "Winter Wonder",
    description: "Cool and sparkly like winter",
    primary: colorPalette.blue.medium,      // Coastal Blue
    secondary: colorPalette.purple.light,   // Lilac Whisper
    accent: '#ffffff',                      // Pure White
    background: '#f8faff',                  // Very Light Blue
    text: primaryBrand.warmEarth,
    preview: [colorPalette.blue.medium, colorPalette.purple.light, '#ffffff'],
    childFriendly: true,
    seasonal: true
  },

  autumnLeaves: {
    name: "Autumn Leaves",
    description: "Warm colors like falling leaves",
    primary: colorPalette.orange.medium,    // Peach Nectar
    secondary: colorPalette.red.medium,     // Coral Pink
    accent: colorPalette.yellow.medium,     // Sunbeam Gold
    background: colorPalette.orange.light,  // Soft Apricot
    text: primaryBrand.warmEarth,
    preview: [colorPalette.orange.medium, colorPalette.red.medium, colorPalette.yellow.medium],
    childFriendly: true,
    seasonal: true
  },

  springBloom: {
    name: "Spring Bloom",
    description: "Fresh colors like new flowers",
    primary: colorPalette.green.light,      // Misty Eucalyptus
    secondary: colorPalette.pink.light,     // Petal Blush
    accent: colorPalette.yellow.lighter,    // Buttercream
    background: colorPalette.green.lighter, // Misty Mint
    text: primaryBrand.warmEarth,
    preview: [colorPalette.green.light, colorPalette.pink.light, colorPalette.yellow.lighter],
    childFriendly: true,
    seasonal: true
  },

  summerFun: {
    name: "Summer Fun",
    description: "Bright and fun like summer days",
    primary: colorPalette.yellow.dark,      // Mustard Grove
    secondary: colorPalette.teal.medium,    // Cool Sage
    accent: colorPalette.orange.light,      // Soft Apricot
    background: colorPalette.yellow.light,  // Honey Butter
    text: primaryBrand.warmEarth,
    preview: [colorPalette.yellow.dark, colorPalette.teal.medium, colorPalette.orange.light],
    childFriendly: true,
    seasonal: true
  },

  // MORE CHILD THEMES
  sweetCandy: {
    name: "Sweet Treats",
    description: "Colorful like favorite treats!",
    primary: colorPalette.purple.medium,    // Mauve Fog
    secondary: colorPalette.pink.medium,    // Rose Dust
    accent: colorPalette.yellow.lighter,    // Buttercream
    background: colorPalette.purple.light,  // Lilac Whisper
    text: primaryBrand.warmEarth,
    preview: [colorPalette.purple.medium, colorPalette.pink.medium, colorPalette.yellow.lighter],
    childFriendly: true
  },

  earthyBrown: {
    name: "Chocolate Fun",
    description: "Warm and cozy like chocolate",
    primary: colorPalette.brown.medium,     // Cinnamon Milk
    secondary: colorPalette.orange.medium,  // Peach Nectar
    accent: colorPalette.yellow.light,      // Honey Butter
    background: colorPalette.brown.light,   // Pale Mocha
    text: primaryBrand.warmEarth,
    preview: [colorPalette.brown.medium, colorPalette.orange.medium, colorPalette.yellow.light],
    childFriendly: true
  },

  skyHigh: {
    name: "Sky High",
    description: "Blue like the big sky above",
    primary: colorPalette.blue.light,       // Storm Cloud
    secondary: colorPalette.teal.light,     // Seafoam
    accent: '#ffffff',                      // Cloud White
    background: '#f0f8ff',                  // Sky Background
    text: primaryBrand.warmEarth,
    preview: [colorPalette.blue.light, colorPalette.teal.light, '#ffffff'],
    childFriendly: true
  },

  gentleRain: {
    name: "Gentle Rain",
    description: "Soft colors like a gentle rain",
    primary: colorPalette.green.mediumDark, // Dusty Sage
    secondary: colorPalette.blue.light,     // Storm Cloud
    accent: colorPalette.green.lighter,     // Misty Mint
    background: '#f5f8f5',                  // Very Light Green
    text: primaryBrand.warmEarth,
    preview: [colorPalette.green.mediumDark, colorPalette.blue.light, colorPalette.green.lighter],
    childFriendly: true
  }
};

// Gradient Generators
export const createGradient = (color1, color2, angle = 135) => 
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

export const gradients = {
  // Primary brand gradients
  primary: createGradient(primaryBrand.sageTeal, primaryBrand.deepOcean),
  background: createGradient(primaryBrand.warmCream, primaryBrand.softGold),
  card: createGradient(primaryBrand.softSage, primaryBrand.softGold),
  
  // New theme gradients
  storm: createGradient('#1a365d', '#4a5568'),
  woodland: createGradient('#2f4f2f', '#8b8680'),
  
  // Child-friendly gradients
  brightSunshine: createGradient(colorPalette.yellow.medium, colorPalette.orange.light),
  oceanWaves: createGradient(colorPalette.teal.medium, colorPalette.blue.medium),
  forestAdventure: createGradient(colorPalette.green.medium, colorPalette.green.light),
  prettyFlowers: createGradient(colorPalette.pink.medium, colorPalette.purple.light),
  winterWonderland: createGradient(colorPalette.blue.medium, colorPalette.purple.light),
  autumnLeaves: createGradient(colorPalette.orange.medium, colorPalette.red.medium),
  springBloom: createGradient(colorPalette.green.light, colorPalette.pink.light),
  summerFun: createGradient(colorPalette.yellow.dark, colorPalette.teal.medium),
  sweetCandy: createGradient(colorPalette.purple.medium, colorPalette.pink.medium),
  earthyBrown: createGradient(colorPalette.brown.medium, colorPalette.orange.medium),
  skyHigh: createGradient(colorPalette.blue.light, colorPalette.teal.light),
  gentleRain: createGradient(colorPalette.green.mediumDark, colorPalette.blue.light)
};

// Status Colors (universal across themes)
export const statusColors = {
  success: colorPalette.green.dark,
  warning: colorPalette.yellow.dark,
  error: colorPalette.red.dark,
  info: colorPalette.teal.dark,
  pending: colorPalette.orange.medium,
  complete: colorPalette.green.medium,
  overdue: colorPalette.red.medium
};

// Utility Functions
export const getFamilyMemberColorByName = (colorName) => {
  return familyMemberColors.find(c => c.name === colorName) || familyMemberColors[0];
};

export const getThemeByName = (themeName) => {
  return personalThemes[themeName] || personalThemes.classic;
};

export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? primaryBrand.warmEarth : primaryBrand.warmCream;
};

export const createThemeVariables = (theme) => ({
  '--primary-color': theme.primary,
  '--secondary-color': theme.secondary,
  '--accent-color': theme.accent,
  '--background-color': theme.background,
  '--text-color': theme.text,
  '--gradient-primary': createGradient(theme.primary, theme.secondary),
  '--gradient-background': createGradient(theme.background, theme.accent + '20')
});

// Get colors grouped by family for color picker
export const getColorsGroupedByFamily = () => {
  const grouped = {};
  familyMemberColors.forEach(color => {
    if (!grouped[color.family]) {
      grouped[color.family] = [];
    }
    grouped[color.family].push(color);
  });
  return grouped;
};

// Get themes grouped by type
export const getThemesGroupedByType = () => {
  const standard = {};
  const seasonal = {};
  const holiday = {};
  const childFriendly = {};
  
  Object.entries(personalThemes).forEach(([key, theme]) => {
    if (theme.childFriendly) {
      childFriendly[key] = theme;
    } else if (theme.holiday) {
      holiday[key] = theme;
    } else if (theme.seasonal) {
      seasonal[key] = theme;
    } else {
      standard[key] = theme;
    }
  });
  
  return { standard, seasonal, holiday, childFriendly };
};

// Get only child-friendly themes
export const getChildFriendlyThemes = () => {
  const childThemes = {};
  Object.entries(personalThemes).forEach(([key, theme]) => {
    if (theme.childFriendly) {
      childThemes[key] = theme;
    }
  });
  return childThemes;
};

// Export default theme
export const defaultTheme = personalThemes.classic;

// Complete export for easy importing
// Change to this:
const colorSystem = {
  primaryBrand,
  colorPalette,
  familyMemberColors,
  personalThemes,
  gradients,
  statusColors,
  getFamilyMemberColorByName,
  getThemeByName,
  getContrastColor,
  createThemeVariables,
  getColorsGroupedByFamily,
  getThemesGroupedByType,
  defaultTheme
};

export default colorSystem;