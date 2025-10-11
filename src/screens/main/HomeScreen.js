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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#212121' }}>
          Welcome, {user?.firstname || 'User'}!
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 24, color: '#757575' }}>
          Here's a look at your day.
        </Text>
        
        <View style={{ backgroundColor: '#C8E6C9', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <MaterialIcons name="assignment" size={32} color="#2E7D32" />
              <Text style={{ fontSize: 14, marginTop: 8, color: '#212121' }}>Open Tasks</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#212121' }}>{pendingTasks}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <MaterialIcons name="error" size={32} color="#2E7D32" />
              <Text style={{ fontSize: 14, marginTop: 8, color: '#212121' }}>Overdue</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#212121' }}>{overdueTasks}</Text>
            </View>
          </View>
        </View>
        
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#212121' }}>Recent Activity</Text>
          {notifications.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="notifications" size={28} color="#FFC107" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#212121', fontSize: 16 }}>
                  {notifications[0].message || notifications[0].title || 'You have a new notification.'}
                </Text>
                {notifications[0].timestamp && (
                  <Text style={{ color: '#757575', fontSize: 13, marginTop: 2 }}>
                    {new Date(notifications[0].timestamp).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={{ color: '#212121' }}>No recent activity.</Text>
          )}
        </View>
      </View>
      
      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
        style={{ backgroundColor: '#D32F2F' }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
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