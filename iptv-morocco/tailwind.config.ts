import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#facc15',
          500: '#D4AF37', // Vibrant Olympic gold
          600: '#b8960f',
          700: '#927a0b',
          800: '#6b5a08',
          900: '#453a05',
          950: '#1e1a02',
        },
        dark: {
          50: '#faf9f6',
          100: '#eeece6',
          200: '#d6d1c4',
          300: '#b5ad98',
          400: '#958c72',
          500: '#756b54',
          600: '#5a523e',
          700: '#3f392a',
          800: '#27221a',
          900: '#181510',
          950: '#0c0a08',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-tajawal)', 'sans-serif'],
      },
      fontSize: {
        'kinetic-hero': ['clamp(2.5rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'kinetic-xl': ['clamp(1.8rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'kinetic-lg': ['clamp(1.3rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'fluid-sm': ['clamp(0.75rem, 1.5vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-xl': ['clamp(1.125rem, 3vw, 1.25rem)', { lineHeight: '1.5' }],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gold-shimmer': 'goldShimmer 4s ease-in-out infinite',
        'float-3d': 'float3d 10s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'scroll-progress': 'scrollProgress linear 1s forwards',
        'count-up': 'countUp 0.4s ease-out forwards',
        'stagger-fade': 'staggerFade 0.6s ease-out forwards',
        'shimmer-premium': 'shimmerPremium 4s ease-in-out infinite',
        'scale-pulse': 'scalePulse 2.5s ease-in-out infinite',
        'smooth-spin': 'spin 8s linear infinite',
        'drift': 'drift 12s ease-in-out infinite',
        'warm-glow': 'warmGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float3d: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'translateY(-12px) rotateX(2deg) rotateY(1deg)' },
          '50%': { transform: 'translateY(-20px) rotateX(-1deg) rotateY(-2deg)' },
          '75%': { transform: 'translateY(-8px) rotateX(1deg) rotateY(1deg)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '25%': { borderRadius: '58% 42% 75% 25% / 76% 46% 54% 24%' },
          '50%': { borderRadius: '50% 50% 33% 67% / 55% 27% 73% 45%' },
          '75%': { borderRadius: '33% 67% 58% 42% / 63% 68% 32% 37%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.15), 0 0 40px rgba(212, 175, 55, 0.05)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.3), 0 0 80px rgba(212, 175, 55, 0.15)' },
        },
        shimmerPremium: {
          '0%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        staggerFade: {
          '0%': { opacity: '0', transform: 'translateY(15px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -10px) rotate(1deg)' },
          '66%': { transform: 'translate(-5px, 5px) rotate(-1deg)' },
        },
        warmGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
