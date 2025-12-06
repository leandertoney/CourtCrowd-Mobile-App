import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {useColorScheme, Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  darkTheme,
  lightTheme,
  darkColors,
  lightColors,
  Theme,
  ThemeColors,
} from '../utilities/theme';

// =============================================================================
// TYPES
// =============================================================================

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  // Current theme mode setting
  themeMode: ThemeMode;

  // Resolved theme (accounts for system preference when mode is 'system')
  theme: Theme;

  // Direct access to colors for convenience
  colors: ThemeColors;

  // Whether the current theme is dark
  isDark: boolean;

  // Function to change theme mode
  setThemeMode: (mode: ThemeMode) => void;

  // Toggle between dark and light (ignores system)
  toggleTheme: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@court_crowd_theme_mode';

// =============================================================================
// PROVIDER
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      // This will trigger a re-render if themeMode is 'system'
    });

    return () => subscription.remove();
  }, []);

  // Determine if we should use dark theme
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Get the resolved theme
  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  // Get colors directly
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  // Set theme mode with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      theme,
      colors,
      isDark,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, theme, colors, isDark, setThemeMode, toggleTheme],
  );

  // Render children immediately with default theme
  // The theme will update once preference is loaded from storage
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// HOOK
// =============================================================================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Convenience hook for just colors
export const useColors = (): ThemeColors => {
  const {colors} = useTheme();
  return colors;
};

// Convenience hook for checking dark mode
export const useIsDark = (): boolean => {
  const {isDark} = useTheme();
  return isDark;
};

export default ThemeContext;
