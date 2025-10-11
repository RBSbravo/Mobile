import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, Snackbar, ActivityIndicator } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator, { linking } from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ErrorProvider, useError } from './src/context/ErrorContext';
import { ThemeProvider as AppThemeProvider, useThemeContext } from './src/context/ThemeContext';
import { View, Text } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { NotificationProvider, useNotification } from './src/context/NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';

// Enable screens for better performance
import { enableScreens } from 'react-native-screens';
enableScreens();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const GlobalNotificationSnackbar = () => {
  const { theme } = useThemeContext();
  const { realtimeNotifications } = useNotification();
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [shownNotificationIds, setShownNotificationIds] = React.useState(new Set());

  React.useEffect(() => {
    if (realtimeNotifications && realtimeNotifications.length > 0) {
      // Only show snackbar for unread notifications that haven't been shown yet
      const unreadNotifications = realtimeNotifications.filter(notif => 
        !notif.isRead && !shownNotificationIds.has(notif.id)
      );
      
      if (unreadNotifications.length > 0) {
        const latest = unreadNotifications[0];
        setMessage(latest.message || latest.title || 'You have a new notification');
        setVisible(true);
        
        // Mark this notification as shown
        setShownNotificationIds(prev => new Set([...prev, latest.id]));
      }
    }
  }, [realtimeNotifications, shownNotificationIds]);

  // Clean up shown notification IDs periodically to prevent memory leaks
  React.useEffect(() => {
    const cleanup = setInterval(() => {
      setShownNotificationIds(prev => {
        const currentNotificationIds = new Set(realtimeNotifications.map(n => n.id));
        return new Set([...prev].filter(id => currentNotificationIds.has(id)));
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanup);
  }, [realtimeNotifications]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={4000}
      style={{ backgroundColor: theme.colors.primary, zIndex: 1000 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', flex: 1 }}>{message}</Text>
        <MaterialIcons name="close" size={22} color="#fff" style={{ marginLeft: 16 }} onPress={() => setVisible(false)} accessibilityLabel="Close notification" />
      </View>
    </Snackbar>
  );
};

const AppContent = () => {
  const { error, hideError } = useError();
  const { theme } = useThemeContext();
  const { loading } = useAuth();

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
      <GlobalNotificationSnackbar />
      <Snackbar
        visible={!!error}
        onDismiss={hideError}
        action={{
          label: 'Dismiss',
          onPress: hideError,
        }}
        style={{ backgroundColor: theme.colors.error }}
        duration={4000}
      >
        {error}
      </Snackbar>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </PaperProvider>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <ErrorProvider>
              <NotificationProvider>
                <NavigationContainer linking={linking}>
                  <AppContent />
                </NavigationContainer>
              </NotificationProvider>
            </ErrorProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

