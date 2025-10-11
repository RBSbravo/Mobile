import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

const ScreenHeader = ({
  title,
  subtitle,
  leftIcon,
  rightAction,
  style,
}) => {
  const paperTheme = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: paperTheme.colors.background, borderBottomColor: paperTheme.colors.border }, style]}>
      <View style={styles.left}>{leftIcon}</View>
      <View style={styles.center}>
        <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.primary }]}> {title} </Text>
        {subtitle ? (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: paperTheme.colors.textSecondary }]}> {subtitle} </Text>
        ) : null}
      </View>
      <View style={styles.right}>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    zIndex: 10,
    width: '100%',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 0,
  },
});

export default ScreenHeader; 