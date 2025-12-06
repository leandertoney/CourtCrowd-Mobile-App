import {Platform, StyleSheet, TextStyle} from 'react-native';

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const darkColors = {
  // Backgrounds
  background: '#121212',
  surface: '#181818',
  surfaceLight: '#282828',
  surfaceLighter: '#3E3E3E',

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#727272',
    inverse: '#121212',
  },

  // Accent (Refined Lime)
  accent: '#B8F000',
  accentDim: '#8BC700',
  accentLight: '#D4FF4D',

  // Semantic
  success: '#1DB954',
  warning: '#F59B23',
  error: '#E91429',
  info: '#3B82F6',

  // Border & Dividers
  border: '#282828',
  divider: '#282828',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Legacy support (for gradual migration)
  primary: '#B8F000',
  secondary: '#FFD814',
  secondry: '#FFD814', // Typo in original codebase
  black: '#000000',
  white: '#FFFFFF',
  red: '#E91429',

  // Legacy gray scale (for backward compatibility)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    150: '#282828',
    200: '#3E3E3E',
    250: '#4A4A4A',
    300: '#727272',
    350: '#B3B3B3',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  blackLight: '#181818',
  black2: '#282828',
  gray1: '#727272',
  gray2: '#3E3E3E',
  gray3: '#B3B3B3',
};

export const lightColors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceLight: '#E8E8E8',
  surfaceLighter: '#D4D4D4',

  // Text
  text: {
    primary: '#121212',
    secondary: '#535353',
    tertiary: '#727272',
    inverse: '#FFFFFF',
  },

  // Accent (Slightly darker for light mode)
  accent: '#8BC700',
  accentDim: '#6B9E00',
  accentLight: '#A8E000',

  // Semantic
  success: '#1DB954',
  warning: '#F59B23',
  error: '#E91429',
  info: '#3B82F6',

  // Border & Dividers
  border: '#E8E8E8',
  divider: '#E8E8E8',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Legacy support
  primary: '#8BC700',
  secondary: '#FFD814',
  secondry: '#FFD814', // Typo in original codebase
  black: '#000000',
  white: '#FFFFFF',
  red: '#E91429',

  // Legacy gray scale (for backward compatibility)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    150: '#E8E8E8',
    200: '#D4D4D4',
    250: '#C0C0C0',
    300: '#727272',
    350: '#535353',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  blackLight: '#F5F5F5',
  black2: '#E8E8E8',
  gray1: '#727272',
  gray2: '#D4D4D4',
  gray3: '#535353',
};

// Type for colors
export type ThemeColors = typeof darkColors;

// Default to dark colors for backward compatibility
export const colors = darkColors;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const fonts = {
  // Display font (branding)
  display: 'GAMEDAY',

  // Inter font family (UI)
  bold: 'Inter_700Bold',
  semiBold: 'Inter_600SemiBold',
  medium: 'Inter_500Medium',
  regular: 'Inter_400Regular',
  light: 'Inter_300Light',

  // Legacy mappings (for gradual migration)
  GameDay: 'GAMEDAY',
  ReadexBold: 'Inter_700Bold',
  ReadexSemiBold: 'Inter_600SemiBold',
  ReadexMedium: 'Inter_500Medium',
  ReadexRegular: 'Inter_400Regular',
  ReadexLight: 'Inter_300Light',
};

// Typography scale
export const typography = {
  // Display (GAMEDAY)
  display: {
    fontSize: 32,
    fontFamily: fonts.display,
    letterSpacing: 1,
  } as TextStyle,

  displaySmall: {
    fontSize: 24,
    fontFamily: fonts.display,
    letterSpacing: 0.5,
  } as TextStyle,

  // Headings (Inter Bold)
  h1: {
    fontSize: 28,
    fontFamily: fonts.bold,
    lineHeight: 36,
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontFamily: fonts.bold,
    lineHeight: 32,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    lineHeight: 28,
  } as TextStyle,

  h4: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    lineHeight: 24,
  } as TextStyle,

  // Body text
  body: {
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    fontFamily: fonts.medium,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  } as TextStyle,

  // Captions & Labels
  caption: {
    fontSize: 12,
    fontFamily: fonts.medium,
    lineHeight: 16,
  } as TextStyle,

  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 20,
    letterSpacing: 0.5,
  } as TextStyle,

  // Micro text
  micro: {
    fontSize: 10,
    fontFamily: fonts.medium,
    lineHeight: 14,
    letterSpacing: 0.5,
  } as TextStyle,

  // Button text
  button: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    lineHeight: 24,
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    lineHeight: 20,
  } as TextStyle,
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Screen padding
export const screenPadding = {
  horizontal: 16,
  vertical: 16,
  top: Platform.OS === 'ios' ? 0 : 16, // Account for safe area
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999, // Pill/Circle
};

// =============================================================================
// SHADOWS (iOS & Android)
// =============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
};

// =============================================================================
// COMPONENT SIZES
// =============================================================================

export const componentSizes = {
  // Buttons
  buttonHeight: {
    sm: 36,
    md: 48,
    lg: 56,
  },

  // Inputs
  inputHeight: 48,

  // Cards
  cardRadius: borderRadius.sm,

  // Chips
  chipHeight: 32,
  chipRadius: borderRadius.full,

  // Avatar
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },

  // Icons
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
  },

  // Bottom tab bar
  tabBarHeight: 80,

  // Header
  headerHeight: 56,
};

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};

// =============================================================================
// LEGACY STYLES (for backward compatibility during migration)
// =============================================================================

export const appStyles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontFamily: fonts.display,
    textShadowColor: '#C82828',
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
    color: colors.white,
    marginTop: Platform.OS === 'ios' ? 50 : 10,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 12,
    width: '73%',
  },
  bottomText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

// =============================================================================
// THEME OBJECT (for context)
// =============================================================================

export const darkTheme = {
  colors: darkColors,
  fonts,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentSizes,
  animation,
  isDark: true,
};

export const lightTheme = {
  colors: lightColors,
  fonts,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentSizes,
  animation,
  isDark: false,
};

export type Theme = typeof darkTheme;
