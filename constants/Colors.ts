const palette = {
  // Brand Accents (Derived from your image)
  tealNeon: '#46F0D2',      // The striking glow accent from the image
  tealDeep: '#00A389',      // A deeper teal for accessible contrast in light mode
  creamWarm: '#FBE2B4',     // The warm secondary accent from the image
  
  // Light Mode Specs
  bgLight: '#F6F8FA',       // Clean, soft off-white
  surfaceLight: '#FFFFFF',  // Pure white for cards
  textLight: '#131321',     // Using the dark background color as text for unity
  textMutedLight: '#626D7F',// Soft gray-blue for secondary text
  borderLight: '#E2E8F0',   // Subtle light divider

  // Dark Mode Specs (Sampled directly from the image)
  bgDark: '#131321',        // Deep midnight blue background
  surfaceDark: '#1C1C2E',   // Slightly lighter elevated surface for cards
  textDark: '#FFFFFF',      // Crisp white text
  textMutedDark: '#8A8A9E', // Muted slate for secondary text
  borderDark: '#26263B',    // Dark divider that doesn't pop too harsh
  
  // System
  error: '#EF4444',         // Standard vibrant error red
};

export const Theme = {
  light: {
    brand: palette.tealDeep,     // Darker teal ensures text/icons remain readable
    background: palette.bgLight,
    card: palette.surfaceLight,
    text: palette.textLight,
    textSecondary: palette.textMutedLight,
    border: palette.borderLight,
    notification: palette.creamWarm,
    error: palette.error,
  },
  dark: {
    brand: palette.tealNeon,     // The beautiful neon pop from the image
    background: palette.bgDark,
    card: palette.surfaceDark,   // Gives depth over the background
    text: palette.textDark,
    textSecondary: palette.textMutedDark,
    border: palette.borderDark,
    notification: palette.creamWarm,
    error: palette.error,
  },
};

export type AppTheme = typeof Theme.light;