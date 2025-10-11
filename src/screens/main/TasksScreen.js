// TasksScreen.js
// This screen displays the user's tasks, allows filtering, searching, and task creation. The TaskItem component and task utility functions have been refactored into separate files for maintainability and clarity.
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import {
  Searchbar,
  Chip,
  Card,
  Title,
  Text,
  FAB,
  Menu,
  Divider,
  ActivityIndicator,
  Button,
  Portal,
  Dialog,
  useTheme,
  Modal,
  TextInput,
  Snackbar,
} from 'react-native-paper';
import { theme, styles as globalStyles } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useError } from '../../context/ErrorContext';
import FileAttachment from '../../components/FileAttachment';
import ScreenHeader from '../../components/ScreenHeader';
import TaskItem from '../../components/TaskItem';
import TaskFilterChips from '../../components/TaskFilterChips';
import { useFocusEffect } from '@react-navigation/native';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { formatDetailedDate } from '../../utils/taskUtils';

const TasksScreen = ({ navigation }) => {
  const paperTheme = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsVisible, setTaskDetailsVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const { user, token } = useAuth();
  const { showError } = useError();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskFiles, setNewTaskFiles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState("");
  const { setupTaskUpdates, cleanupListeners } = useRealtimeUpdates();

  const fetchTasks = useCallback(async () => {
    try {
      const fetchedTasks = await api.getTasks(token, user.id);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load tasks. Please pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, token]);

  // Real-time task updates
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

    const handleTaskAssignment = (data) => {
      setTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, assignedTo: data.assignedToId } : task
      ));
    };

    const handleTaskDeleted = (data) => {
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
    };

    setupTaskUpdates(handleTaskUpdate, handleTaskStatusChange, handleTaskAssignment, handleTaskDeleted);

    return () => {
      cleanupListeners();
    };
  }, [setupTaskUpdates, cleanupListeners]);

  // Refresh tasks when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    let timeout;
    if (loading) {
      timeout = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        const status = (task.status || '').toLowerCase();
        if (statusFilter === 'Completed') {
          matchesStatus = status === 'completed';
        } else if (statusFilter === 'In Progress') {
          matchesStatus = status === 'in progress' || status === 'in_progress';
        } else if (statusFilter === 'Pending') {
          matchesStatus = status === 'pending';
        } else if (statusFilter === 'Declined') {
          matchesStatus = status === 'declined';
        } else {
          matchesStatus = status === statusFilter.toLowerCase();
        }
      }
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const handleTaskPress = useCallback((task) => {
    setSelectedTask(task);
    setTaskDetailsVisible(true);
  }, []);

  const handleViewDetails = useCallback(() => {
    setTaskDetailsVisible(false);
    navigation.navigate('TaskDetail', { taskId: selectedTask.id });
  }, [navigation, selectedTask]);

  const handleCreateTask = async () => {
    setCreating(true);
    try {
      // Simulate task creation
      await new Promise(res => setTimeout(res, 500));
      // Simulate file uploads
      for (const file of newTaskFiles) {
        await api.uploadTaskAttachment('mock-task-id', file, user.token);
      }
      setCreateModalVisible(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskFiles([]);
      fetchTasks();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create task or upload files.');
    } finally {
      setCreating(false);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="assignment" size={48} color={paperTheme.colors.textSecondary} />
      <Text style={[styles.emptyText, { color: paperTheme.colors.text }]}>No tasks found</Text>
      <Text style={[styles.emptySubText, { color: paperTheme.colors.textSecondary }]}>
        {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'
          ? 'Try adjusting your search or filters'
          : 'You have no tasks assigned'}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TaskItem item={item} onPress={handleTaskPress} />
  );

  // --- UI/UX Enhancements ---
  // Helper: Check if any filter is active
  const isFilterActive = statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All';

  // --- Render ---
  if (showSpinner) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScreenHeader
          leftIcon={<MaterialIcons name="assignment" size={28} color={paperTheme.colors.primary} />}
          title="My Tasks"
          subtitle="Manage your tasks here"
        />
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => setCreateModalVisible(true)}
          style={{
            borderRadius: 6,
            borderWidth: 1,
            borderColor: paperTheme.colors.primary,
            marginTop: 8,
            marginBottom: 4,
            alignSelf: 'flex-end',
            paddingHorizontal: 0,
            paddingVertical: 0,
            minHeight: 28,
            minWidth: 80,
          }}
          labelStyle={{ fontWeight: 'bold', fontSize: 12, color: paperTheme.colors.primary, letterSpacing: 0.2 }}
        >
          Create Task
        </Button>
        {/* Filter Chips Row */}
        <TaskFilterChips
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          styles={styles}
        />
        <FlatList
          data={filteredTasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { padding: isTablet ? 32 : 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 90 : 70 }
          ]}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[paperTheme.colors.primary]}
              tintColor={paperTheme.colors.primary}
            />
          }
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? { gap: 24 } : undefined}
        />
        {/* Task Details Dialog */}
        <Portal>
          <Dialog
            visible={taskDetailsVisible}
            onDismiss={() => setTaskDetailsVisible(false)}
            style={[styles.dialog, { backgroundColor: paperTheme.colors.background }]}
          >
            <Dialog.Title style={{ color: paperTheme.colors.text }}>Task Details</Dialog.Title>
            <Dialog.Content>
              {selectedTask && (
                <>
                  <Text style={[styles.dialogTitle, { color: paperTheme.colors.text }]}>{selectedTask.title}</Text>
                  <Text style={[styles.dialogDescription, { color: paperTheme.colors.textSecondary }]}>{selectedTask.description}</Text>
                  <View style={styles.dialogDetails}>
                    <Text style={[styles.dialogDetail, { color: paperTheme.colors.text }]}>Status: {selectedTask.status}</Text>
                    <Text style={[styles.dialogDetail, { color: paperTheme.colors.text }]}>Priority: {selectedTask.priority}</Text>
                    <Text style={[styles.dialogDetail, { color: paperTheme.colors.text }]}>Due Date: {formatDetailedDate(selectedTask.dueDate)}</Text>
                  </View>
                </>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setTaskDetailsVisible(false)} textColor={paperTheme.colors.primary}>Close</Button>
              <Button onPress={handleViewDetails} textColor={paperTheme.colors.primary}>View Full Details</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* Create Task Modal with validation */}
        <Portal>
          <Modal visible={createModalVisible} onDismiss={() => setCreateModalVisible(false)} contentContainerStyle={{ backgroundColor: paperTheme.colors.background, margin: 24, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Create New Task</Text>
            <TextInput
              label="Title"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              style={{ marginBottom: 12 }}
              error={!newTaskTitle.trim() && creating}
            />
            <TextInput
              label="Description"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
              style={{ marginBottom: 12 }}
            />
            <FileAttachment onFilesChange={setNewTaskFiles} />
            <Button mode="contained" onPress={handleCreateTask} loading={creating} disabled={creating || !newTaskTitle.trim()} style={{ marginTop: 12 }}>Create Task</Button>
            <Button onPress={() => setCreateModalVisible(false)} style={{ marginTop: 8 }}>Cancel</Button>
          </Modal>
        </Portal>
        {/* Error Snackbar */}
        <Snackbar
          visible={!!error}
          onDismiss={() => setError("")}
          duration={4000}
          style={{ backgroundColor: theme.colors.error }}
        >
          {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles cleaned up: duplicate keys removed, only unique style keys retained for clarity and maintainability.
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    fontFamily: 'System',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'System',
    marginBottom: theme.spacing.md,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  taskTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: 'System',
  },
  taskDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: 'System',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButton: {
    padding: 8,
  },
  filterChipsContainer: {
    maxHeight: 48,
  },
  filterChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  taskDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.surface,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  dialog: {
    backgroundColor: theme.colors.background,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  dialogDetails: {
    gap: 8,
  },
  dialogDetail: {
    fontSize: 14,
    color: theme.colors.text,
  },
  centeredHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerShadow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: theme.colors.background,
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
    zIndex: 10,
  },
  fixedChip: {
    height: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedChipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    marginVertical: 0,
  },
});

export default TasksScreen; 