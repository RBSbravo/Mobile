import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Switch } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

const DebugPanel = ({ visible, onClose }) => {
  const theme = useTheme();
  const { user, token, isAuthenticated, loading } = useAuth();
  const { theme: appTheme, toggleTheme } = useThemeContext();
  const notificationContext = useNotification();
  const { unreadCount = 0, realtimeNotifications = [] } = notificationContext || {};
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (visible) {
      setDebugInfo({
        user: user ? { id: user.id, email: user.email, firstname: user.firstname } : null,
        token: token ? `${token.substring(0, 20)}...` : null,
        isAuthenticated,
        loading,
        theme: appTheme.dark ? 'dark' : 'light',
        unreadCount,
        realtimeNotificationsCount: realtimeNotifications?.length || 0,
        timestamp: new Date().toISOString(),
      });
    }
  }, [visible, user, token, isAuthenticated, loading, appTheme.dark, unreadCount, realtimeNotifications]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <Card style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.text }]}>
            Debug Information
          </Text>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Authentication
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Authenticated: {isAuthenticated ? 'Yes' : 'No'}
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Loading: {loading ? 'Yes' : 'No'}
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                User: {debugInfo.user ? JSON.stringify(debugInfo.user, null, 2) : 'None'}
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Token: {debugInfo.token || 'None'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Theme
              </Text>
              <View style={styles.switchRow}>
                <Text style={[styles.info, { color: theme.colors.text }]}>
                  Dark Mode: {debugInfo.theme === 'dark' ? 'On' : 'Off'}
                </Text>
                <Switch 
                  value={appTheme.dark} 
                  onValueChange={toggleTheme}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Notifications
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Unread Count: {debugInfo.unreadCount}
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Realtime Notifications: {debugInfo.realtimeNotificationsCount}
              </Text>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                System
              </Text>
              <Text style={[styles.info, { color: theme.colors.text }]}>
                Last Updated: {debugInfo.timestamp}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button 
              mode="outlined" 
              onPress={onClose}
              style={styles.button}
            >
              Close
            </Button>
          </View>
        </Card.Content>
      </Card>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 20,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  button: {
    marginHorizontal: 8,
  },
});

export default DebugPanel;
