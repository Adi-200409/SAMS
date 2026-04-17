// Design System — SAMS Mobile App
// Dark glassmorphism theme matching web app

export const Colors = {
  // Base
  background: '#0A0A1A',
  surface: '#111128',
  surface2: '#1A1A35',

  // Glass
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',
  glassBorderHover: 'rgba(255,255,255,0.2)',

  // Accents
  primary: '#6C63FF',      // Purple
  primaryLight: '#8B83FF',
  primaryDark: '#4B43CC',
  secondary: '#00D4AA',    // Teal
  secondaryLight: '#33DFBE',
  accent: '#FF6B6B',       // Coral/Red

  // Gradients (used with LinearGradient)
  gradientPrimary: ['#6C63FF', '#8B4CF7'],
  gradientSecondary: ['#00D4AA', '#00A8FF'],
  gradientWarm: ['#FF6B6B', '#FF8E53'],
  gradientCool: ['#4facfe', '#00f2fe'],
  gradientDark: ['#0A0A1A', '#111128'],

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  textDisabled: 'rgba(255,255,255,0.25)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Category colors
  tech: '#6C63FF',
  sports: '#22C55E',
  arts: '#FF6B6B',
  music: '#EC4899',
  debate: '#F59E0B',
  research: '#8B83FF',
  hackathon: '#00D4AA',
  social: '#FB923C',
  gaming: '#A855F7',

  // Priority colors
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  base: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
};

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const getCategoryColor = (category: string): string => {
  return (Colors as any)[category] || Colors.primary;
};

export const getPriorityColor = (priority: string): string => {
  return (Colors as any)[priority] || Colors.primary;
};

export const getLevelGradient = (level: number): string[] => {
  const gradients: Record<number, string[]> = {
    1: ['#6C63FF', '#8B83FF'],
    2: ['#00D4AA', '#00A8FF'],
    3: ['#F59E0B', '#FB923C'],
    4: ['#EC4899', '#F43F5E'],
    5: ['#FFD700', '#FFA500'],
  };
  return gradients[level] || gradients[1];
};
