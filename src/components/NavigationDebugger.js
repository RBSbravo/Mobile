import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

const NavigationDebugger = ({ visible = false }) => {
  const theme = useTheme();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (visible) {
      const info = {
        platform: Platform.OS,
        version: Platform.Version,
        isWeb: Platform.OS === 'web',
        userAgent: Platform.OS === 'web' ? navigator.userAgent : 'N/A',
        displayMode: Platform.OS === 'web' ? 
          (window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser') : 'native',
        safeAreaInsets: Platform.OS === 'web' ? {
          top: CSS.supports('padding-top: env(safe-area-inset-top)') ? 'supported' : 'not supported',
          bottom: CSS.supports('padding-bottom: env(safe-area-inset-bottom)') ? 'supported' : 'not supported'
        } : 'N/A'
      };
      setDebugInfo(info);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Navigation Debug Info</Text>
      {Object.entries(debugInfo).map(([key, value]) => (
        <Text key={key} style={[styles.info, { color: theme.colors.text }]}>
          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10000,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default NavigationDebugger;
