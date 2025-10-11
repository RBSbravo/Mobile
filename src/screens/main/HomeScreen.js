import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Text, Card, useTheme, Snackbar } from 'react-native-paper';
import { theme as customTheme, styles as globalStyles } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

const HomeScreen = ({ navigation }) => {
  // Simplified version - bypass all complex logic
  console.log('HomeScreen component is rendering');

  // Return immediately without any complex logic

  return (
    <View style={{ flex: 1, backgroundColor: 'red', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        TEST: HomeScreen is working!
      </Text>
      <Text style={{ color: 'white', fontSize: 16, marginTop: 10 }}>
        User: {user?.firstname || 'No user'}
      </Text>
      <Text style={{ color: 'white', fontSize: 16 }}>
        Token: {token ? 'Yes' : 'No'}
      </Text>
      <Text style={{ color: 'white', fontSize: 16 }}>
        Auth Loading: {authLoading ? 'Yes' : 'No'}
      </Text>
      <Text style={{ color: 'white', fontSize: 16 }}>
        Show Spinner: {showSpinner ? 'Yes' : 'No'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: customTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: customTheme.spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statCardContent: {
    alignItems: 'center',
    gap: customTheme.spacing.sm,
  },
  statLabel: {
    fontFamily: customTheme.typography.fontFamily.medium,
    fontSize: 14,
  },
  statValue: {
    fontFamily: customTheme.typography.fontFamily.bold,
    fontSize: 24,
  },
  section: {
    marginBottom: customTheme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: customTheme.typography.fontFamily.bold,
    marginBottom: customTheme.spacing.md,
  },
  activityCard: {
    // Styling is now applied dynamically
  },
});

export default HomeScreen; 