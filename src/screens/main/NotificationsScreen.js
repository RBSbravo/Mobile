import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { Text, Chip, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { theme as customTheme, styles as globalStyles } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useError } from '../../context/ErrorContext';
import ScreenHeader from '../../components/ScreenHeader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useNotification } from '../../context/NotificationContext';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

const getNotificationIcon = (type, color) => {
  switch (type) {
    case 'task_assigned':
    case 'task_updated':
      return <MaterialIcons name="assignment" size={24} color={color} />;
    case 'comment_added':
      return <MaterialIcons name="comment" size={24} color={color} />;
    case 'file_uploaded':
      return <MaterialIcons name="attach-file" size={24} color={color} />;
    case 'system':
      return <MaterialIcons name="info" size={24} color={color} />;
    default:
      return <MaterialIcons name="notifications" size={24} color={color} />;
  }
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' }
];

const NotificationsScreen = () => {
  const paperTheme = useTheme();
  const { user, token } = useAuth();
  const { refreshUnreadCount, realtimeNotifications } = useNotification();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { setupPerformanceUpdates, cleanupListeners, setupNotificationUpdates } = useRealtimeUpdates();
  const { showError } = useError();

  // Real-time updates for notifications
  useEffect(() => {
    const handlePerformanceUpdate = (performance) => {
      // Refresh notifications when performance metrics change
      fetchNotifications();
    };

    const handleNotificationRemoved = (data) => {
      setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
    };

    setupPerformanceUpdates(handlePerformanceUpdate);
    setupNotificationUpdates(handleNotificationRemoved);

    return () => {
      cleanupListeners();
    };
  }, [setupPerformanceUpdates, setupNotificationUpdates, cleanupListeners]);

  // Refresh unread count when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  // Add new real-time notifications to the list
  useEffect(() => {
    if (realtimeNotifications && realtimeNotifications.length > 0) {
      const newNotifications = realtimeNotifications.filter(notification => {
        // Filter out notifications without proper content
        const hasContent = notification.title || notification.message || notification.data?.message;
        const isNew = !notifications.some(existing => existing.id === notification.id);
        return hasContent && isNew;
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    }
  }, [realtimeNotifications, notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user) return;
      setLoading(true);
      const fetchedNotifications = await api.getNotifications(token);
      
      // Filter out notifications without proper content
      const validNotifications = fetchedNotifications.filter(notification => {
        const hasContent = notification.title || notification.message;
        return hasContent;
      });
      
      setNotifications(validNotifications.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)));
    } catch (error) {
      showError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user, token, showError]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshUnreadCount();
    } catch (error) {
      showError('Failed to update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch (error) {
      showError('Failed to update notifications.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id, token);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
    } catch (error) {
      showError('Failed to delete notification.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;
  const totalCount = notifications.length;

  const filteredNotifications = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.isRead;
    if (tab === 'read') return n.isRead;
    return true;
  });

  const handleNotificationPress = async (item) => {
    try {
      if (!item.isRead) {
        await api.markNotificationAsRead(item.id, token);
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
        refreshUnreadCount();
      }
      // Redirect logic based on notification type/data
      if (item.taskId || item.task_id) {
        navigation.push('TaskDetail', { taskId: item.taskId || item.task_id });
      } else if (item.ticketId || item.ticket_id) {
        navigation.push('TicketDetail', { ticketId: item.ticketId || item.ticket_id });
      } // else: optionally handle other types
    } catch (error) {
      showError('Failed to update notification.');
    }
  };

  const renderItem = ({ item }) => {
    const isRead = item.isRead;
    const itemStyle = {
      backgroundColor: isRead ? paperTheme.colors.surface : paperTheme.colors.primaryContainer,
      ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 })
    };

    // Handle empty or missing notification data
    let notificationTitle = item.title || '';
    let notificationMessage = item.message || '';
    
    // If we have both title and message, use them as is
    // If we only have one of them, use it for both to avoid duplication
    if (notificationTitle && notificationMessage) {
      // Both exist, use them as is
    } else if (notificationTitle && !notificationMessage) {
      // Only title exists, use it for both
      notificationMessage = notificationTitle;
    } else if (!notificationTitle && notificationMessage) {
      // Only message exists, use it for both
      notificationTitle = notificationMessage;
    } else {
      // Neither exists, use fallback
      notificationTitle = 'New notification';
      notificationMessage = 'You have a new notification';
    }

    const notificationTime = getTimeAgo(item.date || item.createdAt);

    // Skip rendering if the notification has no meaningful content
    if (!notificationTitle && !notificationMessage) {
      return null;
    }

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.7}>
        <View style={[styles.notificationItem, itemStyle, { flexDirection: 'row', alignItems: 'center', padding: 10 }]}> 
          {getNotificationIcon(item.type, isRead ? paperTheme.colors.textSecondary : paperTheme.colors.primary)}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: paperTheme.colors.text, fontWeight: isRead ? 'normal' : 'bold' }}>
              {notificationTitle}
            </Text>
            {notificationTitle !== notificationMessage && (
              <Text style={{ color: paperTheme.colors.textSecondary, fontSize: 13 }}>
                {notificationMessage}
              </Text>
            )}
            <Text style={{ color: paperTheme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              {notificationTime}
            </Text>
          </View>
          {!isRead && (
            <TouchableOpacity onPress={() => handleMarkAsRead(item.id)} accessibilityLabel="Mark as read" style={{ marginRight: 4 }}>
              <MaterialIcons name="done" size={22} color={paperTheme.colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item.id)} accessibilityLabel="Delete notification">
            <MaterialIcons name="delete" size={22} color={paperTheme.colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
      <ScreenHeader
        leftIcon={<MaterialIcons name="notifications" size={28} color={paperTheme.colors.primary} />}
        title="Notifications"
        rightAction={
          <Button
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            compact
            mode="text"
            style={{ minWidth: 0, paddingHorizontal: 0 }}
            labelStyle={{ fontSize: 16, color: paperTheme.colors.primary }}
            icon={() => <MaterialIcons name="done-all" size={22} color={paperTheme.colors.primary} />}
            accessibilityLabel="Mark all as read"
          />
        }
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: isTablet ? 16 : 8 }}>
        {TABS.map(t => {
          let count = 0;
          if (t.key === 'all') count = totalCount;
          else if (t.key === 'unread') count = unreadCount;
          else if (t.key === 'read') count = readCount;
          return (
            <Chip
              key={t.key}
              selected={tab === t.key}
              onPress={() => setTab(t.key)}
              style={{ marginHorizontal: isTablet ? 8 : 4, backgroundColor: tab === t.key ? paperTheme.colors.primary : paperTheme.colors.surface, minHeight: isTablet ? 40 : 32, minWidth: isTablet ? 80 : 56 }}
              textStyle={{ color: tab === t.key ? '#fff' : paperTheme.colors.text, fontSize: isTablet ? 16 : 14 }}
            >
              {t.label} {count > 0 ? `(${count})` : ''}
            </Chip>
          );
        })}
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: isTablet ? 48 : 32 }} />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No notifications found.</Text>}
          refreshing={loading}
          onRefresh={fetchNotifications}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isTablet ? 32 : 12, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: customTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: customTheme.colors.border,
  },
  title: {
    fontFamily: customTheme.typography.fontFamily.bold,
  },
  notificationItem: {
    marginVertical: 4,
    marginHorizontal: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.md,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  centeredHeader: {},
  headerShadow: {},
});

export default NotificationsScreen; 