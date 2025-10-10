import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const FullScreenLoader = ({ visible, message = 'Loading...' }) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.spinner}
          />
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FullScreenLoader;
