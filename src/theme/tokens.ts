export const palette = {
  primary: '#7C3AED',
  exchange: '#06B6D4',
  enchere: '#F97316',
  success: '#10B981',
  danger: '#EF4444',
  tokens: '#F59E0B',
  elo: '#3B82F6',
  xp: '#EC4899',
  clubs: '#84CC16',
  spectators: '#94A3B8',
  rainbow: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'],
} as const;

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2A2A2A',
    disabled: '#2A2A2A',
    disabledText: '#555555',
    ...palette,
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 16, full: 999 },
  typography: {
    title: { fontFamily: 'Rajdhani-Bold', fontSize: 28 },
    subtitle: { fontFamily: 'Rajdhani-Bold', fontSize: 20 },
    body: { fontFamily: 'Inter-Regular', fontSize: 16 },
    bodyMedium: { fontFamily: 'Inter-Medium', fontSize: 16 },
    caption: { fontFamily: 'Inter-Regular', fontSize: 13 },
    mono: { fontFamily: 'RobotoMono-Bold', fontSize: 32 },
    decorative: { fontFamily: 'BebasNeue-Regular', fontSize: 24, letterSpacing: 1 },
  },
};

export const lightTheme = {
  ...darkTheme,
  mode: 'light' as const,
  colors: {
    ...darkTheme.colors,
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#111111',
    textSecondary: '#555555',
    border: '#E0E0E0',
    disabled: '#E0E0E0',
    disabledText: '#999999',
  },
};

export type AppTheme = typeof darkTheme | typeof lightTheme;
