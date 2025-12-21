// Neo-Brutalist Design Tokens
// Source: apps/dashboard/components/hacker-portal/neo-hacker-portal.tsx

export const neoColors = {
  background: '#FFFDF7',
  surface: '#FFF',
  text: '#000',
  textMuted: '#555',
  textLight: '#666',

  accent: {
    red: '#FF5C5C',
    yellow: '#FFE566',
    blue: '#0077B6',
    green: '#2D6A4F',
    gray: '#666',
  },

  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#0077B6',
  },
} as const;

export const neoBorders = {
  standard: '2px solid #000',
  thick: '3px solid #000',
} as const;

export const neoShadows = {
  small: '3px 3px 0 #000',
  medium: '4px 4px 0 #000',
  large: '6px 6px 0 #000',
  none: 'none',
  colored: (color: string) => `4px 4px 0 ${color}`,
} as const;

export const neoPadding = {
  sm: '0.75rem',
  md: '1.25rem 1.5rem',
  lg: '2rem',
} as const;

export const neoTransition = 'all 0.1s ease';

// Button hover transform values
export const neoButtonStates = {
  hover: {
    transform: 'translate(2px, 2px)',
    shadow: '1px 1px 0 #000',
  },
  active: {
    transform: 'translate(3px, 3px)',
    shadow: 'none',
  },
} as const;
