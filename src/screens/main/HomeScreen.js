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
import DebugPanel from '../../components/DebugPanel';

const HomeScreen = ({ navigation }) => {
  const paperTheme = useTheme();
  const { user, token, loading: authLoading } = useAuth();
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
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
    <SafeAreaView style={[globalStyles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScreenHeader
          leftIcon={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: paperTheme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{user?.firstname ? user.firstname.charAt(0).toUpperCase() : 'U'}</Text></View>}
          title={`Welcome, ${user?.firstname || 'User'}!`}
          subtitle={"Here's a look at your day."}
          rightAction={
            <MaterialIcons 
              name="bug-report" 
              size={24} 
              color={paperTheme.colors.primary} 
              onPress={() => setShowDebugPanel(true)}
              style={{ padding: 8 }}
            />
          }
        />
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { padding: isTablet ? 32 : 16 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        <View style={{ marginVertical: customTheme.spacing.lg, backgroundColor: paperTheme.colors.border, height: 1, width: '100%' }} />
        <View style={{
          backgroundColor: paperTheme.colors.primaryContainer,
          borderRadius: customTheme.borderRadius.lg,
          padding: isTablet ? customTheme.spacing.lg * 2 : customTheme.spacing.md,
          marginBottom: customTheme.spacing.xl,
          ...customTheme.shadows.sm,
        }}>
          <View style={[styles.statsGrid, { flexDirection: isTablet ? 'row' : 'column', gap: isTablet ? customTheme.spacing.lg : customTheme.spacing.md }]}> 
            <View style={{ flex: 1, marginRight: isTablet ? customTheme.spacing.lg : customTheme.spacing.sm, marginBottom: isTablet ? 0 : customTheme.spacing.md }}>
              <StatCard icon="assignment" label="Open Tasks" value={pendingTasks} />
            </View>
            <View style={{ flex: 1, marginLeft: isTablet ? customTheme.spacing.lg : customTheme.spacing.sm }}>
              <StatCard icon="error" label="Overdue" value={overdueTasks} />
            </View>
          </View>
        </View>
        <View style={{ marginVertical: customTheme.spacing.lg, backgroundColor: paperTheme.colors.border, height: 1, width: '100%' }} />
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: paperTheme.colors.text }]}>Recent Activity</Text>
          {notifications.length > 0 ? notifications.slice(0, 1).map((n, idx) => (
            <Card key={n.id || idx} style={[styles.activityCard, { backgroundColor: paperTheme.colors.surface, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]} mode="elevated">
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="notifications" size={28} color={paperTheme.colors.accent} style={{ marginRight: customTheme.spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: paperTheme.colors.text, fontFamily: customTheme.typography.fontFamily.medium, fontSize: isTablet ? 18 : 16 }}>{n.message || n.title || 'You have a new notification.'}</Text>
                  {n.timestamp && (
                    <Text style={{ color: paperTheme.colors.textSecondary, fontSize: isTablet ? 15 : 13, marginTop: 2 }}>{new Date(n.timestamp).toLocaleString()}</Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          )) : (
            <Card style={[styles.activityCard, { backgroundColor: paperTheme.colors.surface }]} mode="elevated">
              <Card.Content>
                <Text style={{color: paperTheme.colors.text}}>No recent activity.</Text>
              </Card.Content>
            </Card>
          )}
        </View>
        </ScrollView>
        <Snackbar
          visible={!!error}
          onDismiss={() => setError("")}
          duration={4000}
          style={{ backgroundColor: paperTheme.colors.error }}
        >
          {error}
        </Snackbar>
        <DebugPanel 
          visible={showDebugPanel} 
          onClose={() => setShowDebugPanel(false)} 
        />
      </KeyboardAvoidingView>
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