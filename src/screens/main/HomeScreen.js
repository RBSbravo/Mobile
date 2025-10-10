import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
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
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { setupTaskUpdates, setupPerformanceUpdates, cleanupListeners } = useRealtimeUpdates();

  useEffect(() => {
    let timeout;
    if (authLoading) {
      timeout = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timeout);
  }, [authLoading]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [tasksData, notificationsData] = await Promise.all([
        api.getTasks(token),
        api.getNotifications(token)
      ]);
      setTasks(tasksData.tickets || tasksData.tasks || tasksData); // handle both array and object
      setNotifications(notificationsData.notifications || notificationsData);
    } catch (err) {
      setError('Failed to load dashboard data.');
    }
  }, [token]);

  // Real-time updates for dashboard
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    };

    const handleTaskStatusChange = (data) => {
      setTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, status: data.status } : task
      ));
    };

    const handleTaskDeleted = (data) => {
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
    };

    const handlePerformanceUpdate = (performance) => {
      // Refresh dashboard data when performance metrics change
      fetchData();
    };

    setupTaskUpdates(handleTaskUpdate, handleTaskStatusChange, undefined, handleTaskDeleted);
    setupPerformanceUpdates(handlePerformanceUpdate);

    return () => {
      cleanupListeners();
    };
  }, [setupTaskUpdates, setupPerformanceUpdates, cleanupListeners, fetchData]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const pendingTasks = tasks.filter(t => t.status && t.status.toLowerCase() === 'pending').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate && !t.due_date) return false;
    const due = new Date(t.dueDate || t.due_date);
    return t.status && t.status.toLowerCase() !== 'completed' && due < new Date();
  }).length;

  if (showSpinner) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  const StatCard = ({ icon, label, value }) => (
    <Card 
      style={[
        { 
          backgroundColor: paperTheme.colors.surface,
          ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 })
        }
      ]}
      mode="elevated"
    >
      <Card.Content style={styles.statCardContent}>
        <MaterialIcons name={icon} size={32} color={paperTheme.colors.primary} />
        <Text style={[styles.statLabel, { color: paperTheme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.statValue, { color: paperTheme.colors.text }]}>{value}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'red', // Debug color
        padding: 20
      }}>
        <Text style={{ fontSize: 24, color: 'white', textAlign: 'center' }}>
          DEBUG: HomeScreen Content
        </Text>
        <Text style={{ fontSize: 16, color: 'white', textAlign: 'center', marginTop: 10 }}>
          If you can see this, the screen is working!
        </Text>
      </View>
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