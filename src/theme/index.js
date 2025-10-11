import { DefaultTheme } from 'react-native-paper';

const colors = {
  primary: '#2E7D32', // A deeper green for primary actions
  primaryContainer: '#C8E6C9', // A light green for containers or highlights
  secondary: '#4CAF50', // A brighter green for secondary elements
  accent: '#FFC107', // A warm accent color
  background: '#F5F5F5', // A very light grey for the main background
  surface: '#FFFFFF', // White for card backgrounds, etc.
  text: '#212121', // Primary text color
  textSecondary: '#757575', // Lighter text for subtitles, etc.
  placeholder: '#BDBDBD',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#FBC02D',
  border: '#E0E0E0',
};

const darkColors = {
  primary: '#66BB6A', // A lighter green for dark mode primary actions
  primaryContainer: '#2E7D32', // Darker green for containers in dark mode
  secondary: '#81C784',
  accent: '#FFCA28',
  background: '#121212', // Standard dark background
  surface: '#1E1E1E', // Slightly lighter surface for cards
  text: '#E0E0E0', // Light grey text
  textSecondary: '#BDBDBD', // Dimmer text
  placeholder: '#757575',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA000', // Darker yellow for better contrast with light text
  border: '#424242',
};

const themeBase = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
  ...themeBase,
};

export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    ...darkColors,
  },
  ...themeBase,
};

// For legacy components that might not use the Paper provider theme
export const theme = lightTheme;

export const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: themeBase.spacing.lg,
  },
  title: {
    fontFamily: themeBase.typography.fontFamily.bold,
    fontSize: themeBase.typography.fontSize.xl,
    marginBottom: themeBase.spacing.sm,
  },
  subtitle: {
    fontFamily: themeBase.typography.fontFamily.regular,
    fontSize: themeBase.typography.fontSize.md,
    color: colors.textSecondary,
  },
  input: {
    marginBottom: themeBase.spacing.md,
  },
  button: {
    marginTop: themeBase.spacing.md,
  },
}; 