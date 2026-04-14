import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT:    'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border:     'hsl(var(--sidebar-border))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border:  'hsl(var(--border))',
        ring:    'hsl(var(--ring))',
        // Callout semantic palette — drives <Callout variant="..."> tints.
        // Values come from the --callout-* CSS custom properties defined per
        // theme in src/index.css, so each theme can retune individual colors.
        callout: {
          danger:     'hsl(var(--callout-danger))',
          key:        'hsl(var(--callout-key))',
          tip:        'hsl(var(--callout-tip))',
          note:       'hsl(var(--callout-note))',
          caution:    'hsl(var(--callout-caution))',
          experiment: 'hsl(var(--callout-experiment))',
          onair:      'hsl(var(--callout-onair))',
          math:       'hsl(var(--callout-math))',
        },
      },
      // Keyframes for these live in src/index.css. Declaring the named
      // animations here so they are usable as `animate-toast-in` /
      // `animate-toast-out` Tailwind utilities.
      animation: {
        'toast-in':  'toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'toast-out': 'toast-out 0.35s ease-in forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
