// Plyaz Design System - Design Tokens
// Monochrome Minimalism with Premium Motion

export const colors = {
  // Primary Palette
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9F9F9',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#1A1A1A',
  },
  
  // Semantic Colors (monochrome variants)
  success: {
    DEFAULT: '#000000',
    light: '#F9F9F9',
    dark: '#1A1A1A',
    foreground: '#FFFFFF',
  },
  error: {
    DEFAULT: '#000000',
    light: '#FEF2F2',
    dark: '#1A1A1A',
    foreground: '#FFFFFF',
  },
  warning: {
    DEFAULT: '#525252',
    light: '#F9F9F9',
    dark: '#262626',
    foreground: '#FFFFFF',
  },
  info: {
    DEFAULT: '#737373',
    light: '#F5F5F5',
    dark: '#404040',
    foreground: '#FFFFFF',
  },
  
  // Interactive States
  hover: '#1A1A1A',
  active: '#262626',
  disabled: '#A3A3A3',
  
  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E5E5E5',
    inverse: '#000000',
  },
  
  // Borders
  border: {
    light: '#E5E5E5',
    medium: '#D4D4D4',
    strong: '#000000',
  }
} as const;

export const typography = {
  fontFamily: {
    primary: ['DM Sans', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  }
} as const;

// Typography Variants
export const textVariants = {
  // Headlines
  h1: 'text-4xl md:text-6xl font-black tracking-tight',
  h2: 'text-3xl md:text-5xl font-extrabold tracking-tight',
  h3: 'text-2xl md:text-4xl font-bold tracking-tight',
  h4: 'text-xl md:text-2xl font-bold',
  h5: 'text-lg md:text-xl font-bold',
  h6: 'text-base md:text-lg font-bold',
  
  // Body Text
  body: 'text-base font-medium leading-relaxed',
  'body-sm': 'text-sm font-medium leading-normal',
  'body-lg': 'text-lg font-medium leading-relaxed',
  
  // UI Elements
  button: 'text-base font-bold tracking-wide uppercase',
  'button-sm': 'text-sm font-bold tracking-wide uppercase',
  caption: 'text-sm font-normal opacity-70',
  overline: 'text-xs font-bold tracking-wide uppercase',
  
  // Brand
  logo: 'text-4xl font-black tracking-tight',
  'logo-sm': 'text-2xl font-black tracking-tight',
} as const;

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const shadows = {
  plyaz: '8px 8px 0px 0px #000000',
  'plyaz-sm': '4px 4px 0px 0px #000000',
  'plyaz-lg': '12px 12px 0px 0px #000000',
  'plyaz-xl': '16px 16px 0px 0px #000000',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Animation timing constants
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  easing: {
    default: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
  },
  spring: {
    stiffness: 300,
    damping: 30,
  },
  bounce: {
    stiffness: 400,
    damping: 30,
  }
} as const;

// Component variants
export const variants = {
  button: {
    primary: 'bg-black text-white hover:bg-gray-900 active:bg-gray-800 border-2 border-black',
    secondary: 'bg-white text-black hover:bg-gray-50 active:bg-gray-100 border-2 border-black',
    ghost: 'bg-transparent text-black hover:bg-gray-100 active:bg-gray-200',
    outline: 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white',
  },
  card: {
    default: 'bg-white border-2 border-black rounded-lg',
    elevated: 'bg-white border-2 border-black rounded-lg shadow-plyaz',
    outlined: 'bg-transparent border-2 border-black rounded-lg',
    ghost: 'bg-gray-50 border-2 border-gray-200 rounded-lg',
  }
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  typography,
  textVariants,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animation,
  variants,
  zIndex,
} as const;

export default tokens;