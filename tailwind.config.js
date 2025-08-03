/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
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
      colors: {
        // Monochrome Primary Palette
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
        },

        // Legacy support for existing components
        primary: '#000000',
        'primary-foreground': '#FFFFFF',
        secondary: '#F5F5F5',
        'secondary-foreground': '#000000',
        destructive: '#000000',
        'destructive-foreground': '#FFFFFF',
        muted: '#F5F5F5',
        'muted-foreground': '#737373',
        accent: '#F5F5F5',
        'accent-foreground': '#000000',
        popover: '#FFFFFF',
        'popover-foreground': '#000000',
        card: '#FFFFFF',
        'card-foreground': '#000000',
        input: '#E5E5E5',
        ring: '#000000',
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
      },
      spacing: {
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
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        'plyaz': '8px 8px 0px 0px #000000',
        'plyaz-sm': '4px 4px 0px 0px #000000',
        'plyaz-lg': '12px 12px 0px 0px #000000',
        'plyaz-xl': '16px 16px 0px 0px #000000',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.8'
          },
        },
      },
      transitionTimingFunction: {
        'plyaz': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'plyaz-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '50': '50ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
        '550': '550ms',
        '650': '650ms',
        '750': '750ms',
        '850': '850ms',
        '950': '950ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}