import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Card, useTheme, Snackbar } from 'react-native-paper';
import { theme as customTheme, styles as globalStyles } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

const HomeScreen = ({ navigation }) => {
  const paperTheme = useTheme();
  const { user, token, loading: authLoading } = useAuth();

  console.log('HomeScreen render:', {
    hasUser: !!user,
    hasToken: !!token,
    authLoading,
    user: user
  });

  console.log('HomeScreen: Rendering SIMPLE content');

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#F5F5F5',
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#212121', 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        🎉 SUCCESS! Content is now visible!
      </Text>
      
      <Text style={{ 
        fontSize: 18, 
        color: '#757575', 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Welcome, {user?.firstname || 'User'}!
      </Text>
      
      <View style={{
        backgroundColor: '#C8E6C9',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%'
      }}>
        <Text style={{ fontSize: 16, color: '#212121', textAlign: 'center' }}>
          Dashboard is working! 🚀
        </Text>
      </View>
      
      <Text style={{ 
        fontSize: 14, 
        color: '#757575', 
        textAlign: 'center',
        marginTop: 20
      }}>
        The content area is now displaying properly.
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