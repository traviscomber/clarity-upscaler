/**
 * Clar1ty Design Token System
 * Professional image upscaling interface tokens
 */

export const tokens = {
  // Colors - Clar1ty Brand (www.clar1ty.art)
  colors: {
    background: '#1a1410',      // Deep brown-black
    foreground: '#e8e4dd',      // Warm off-white
    surface: '#1f1a16',         // Slightly lighter brown
    surfaceElevated: '#2d2620', // Elevated surface
    primary: '#ffffff',         // Pure white for contrast
    accent: {
      gold: '#d4a574',          // Warm gold primary
      goldLight: '#e8d9c7',     // Light gold for hover states
      goldDark: '#c9a961',      // Dark gold for active states
    },
    muted: '#8b8278',           // Muted taupe
    border: '#3a3530',          // Dark brown border
    success: '#7cb342',         // Subtle success green
    warning: '#ffd54f',         // Gold-aligned warning
    error: '#ff6b6b',           // Soft red
  },

  // Typography
  typography: {
    display: {
      fontFamily: 'Inter Tight',
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: '1.2',
    },
    heading: {
      fontFamily: 'Inter Tight',
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '1.3',
    },
    body: {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    bodySmall: {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.4',
    },
    technical: {
      fontFamily: 'JetBrains Mono',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.6',
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Borders
  borders: {
    radius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
    },
    width: {
      thin: '1px',
      base: '2px',
    },
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.3)',
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    tooltip: 50,
    notification: 60,
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export type Tokens = typeof tokens;
