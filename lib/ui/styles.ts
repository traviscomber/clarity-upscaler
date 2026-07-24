/**
 * Clar1ty UI Component Styles
 * Centralized Tailwind class combinations for consistent branding
 */

export const button = {
  primary: `
    px-6 py-2.5 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold
    hover:bg-[#e8d9c7] transition-colors transform hover:scale-105
    active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50
    disabled:cursor-not-allowed
  `,
  secondary: `
    px-6 py-2.5 rounded-lg bg-[#2d2620] text-[#d4a574] font-semibold
    border border-[#d4a574] hover:bg-[#3a3530] transition-colors
    transform hover:scale-105 active:scale-95 disabled:opacity-50
  `,
  ghost: `
    px-6 py-2.5 rounded-lg text-[#d4a574]
    hover:bg-[#2d2620] transition-colors disabled:opacity-50
  `,
};

export const input = {
  base: `
    w-full px-4 py-2.5 rounded-lg bg-[#2d2620] border border-[#3a3530]
    text-[#e8e4dd] placeholder-[#8b8278] transition-all
    focus:outline-none focus:border-[#d4a574] focus:ring-2
    focus:ring-[#d4a574] focus:ring-opacity-20
  `,
};

export const card = {
  default: `
    bg-[#1f1a16] border border-[#3a3530] rounded-lg p-6
    shadow-sm hover:shadow-md transition-shadow
    border-l-4 border-l-[#d4a574]
  `,
  elevated: `
    bg-[#2d2620] border border-[#3a3530] rounded-lg p-6
    shadow-lg hover:shadow-xl transition-shadow
    border-l-4 border-l-[#d4a574]
  `,
};

export const badge = {
  gold: `
    inline-flex items-center gap-2 px-3 py-1 rounded-full
    bg-[#d4a574] text-[#1a1410] text-xs font-semibold
  `,
  outline: `
    inline-flex items-center gap-2 px-3 py-1 rounded-full
    border border-[#d4a574] text-[#d4a574] text-xs font-semibold
  `,
  muted: `
    inline-flex items-center gap-2 px-3 py-1 rounded-full
    bg-[#2d2620] text-[#8b8278] text-xs font-semibold
  `,
};

export const link = `
  text-[#d4a574] hover:text-[#e8d9c7] transition-colors
  underline-offset-2 hover:underline
`;

export const heading = {
  h1: 'text-5xl md:text-6xl font-bold text-[#ffffff] text-balance',
  h2: 'text-4xl md:text-5xl font-bold text-[#ffffff] text-balance',
  h3: 'text-2xl md:text-3xl font-bold text-[#ffffff] text-balance',
  h4: 'text-xl md:text-2xl font-bold text-[#ffffff] text-balance',
};

export const text = {
  body: 'text-[#e8e4dd] leading-relaxed',
  muted: 'text-[#8b8278]',
  contrast: 'text-[#ffffff]',
  accent: 'text-[#d4a574]',
};

export const container = {
  narrow: 'max-w-2xl mx-auto',
  normal: 'max-w-4xl mx-auto',
  wide: 'max-w-6xl mx-auto',
  full: 'max-w-7xl mx-auto',
};

export const spacing = {
  xs: 'px-4 py-2',
  sm: 'px-6 py-3',
  md: 'px-8 py-4',
  lg: 'px-12 py-6',
  xl: 'px-16 py-8',
};

export const gradient = {
  gold: 'bg-gradient-to-r from-[#d4a574] to-[#d4a574]',
  goldToWhite: 'bg-gradient-to-r from-[#d4a574] to-[#e8e4dd]',
};
