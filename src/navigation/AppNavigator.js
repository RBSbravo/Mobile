import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useThemeContext } from '../context/ThemeContext';
import { NotificationProvider, useNotification } from '../context/NotificationContext';
import FullScreenLoader from '../components/FullScreenLoader';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import TasksScreen from '../screens/main/TasksScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import TaskDetailScreen from '../screens/detail/TaskDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import FileViewerScreen from '../screens/detail/FileViewerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['mito://'],
  config: {
    screens: {
      // ...other screens
    },
  },
};

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useThemeContext();
  return (
    <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const icon = options.tabBarIcon({ 
          focused: isFocused, 
          color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
          size: 24 
        });

        const label = options.tabBarLabel || route.name;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.tabItemContent}>
              {icon}
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? theme.colors.primary : theme.colors.textSecondary }
              ]}>
                {label}
              </Text>
              {isFocused && <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Stack navigators for each tab
const HomeStack = () => {
  const { theme } = useThemeContext();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          color: theme.colors.text,
        }
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
};

const TasksStack = () => {
  const { theme } = useThemeContext();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          color: theme.colors.text,
        }
      }}
    >
      <Stack.Screen name="TasksMain" component={TasksScreen} />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
};

const NotificationsStack = () => {
  const { theme } = useThemeContext();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          color: theme.colors.text,
        }
      }}
    >
      <Stack.Screen name="NotificationsMain" component={NotificationsScreen} />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { theme } = useThemeContext();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          color: theme.colors.text,
        }
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const { user } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotification();

  useEffect(() => {
    const fetchCount = async () => {
      if (user?.id) {
        try {
          const count = await api.getUnreadNotificationCount(user.id);
          refreshUnreadCount(count);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }
    };
    fetchCount();
  }, [user, refreshUnreadCount]);

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialIcons name="notifications" size={size} color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: theme.colors.error,
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 2,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading, logoutLoading, loginLoading } = useAuth();

  if (loading) {
    // You might want to return a loading spinner here
    return null;
  }

  return (
    <NotificationProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="FileViewer" component={FileViewerScreen} options={{ headerShown: true, headerTitle: 'File Viewer' }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
      <FullScreenLoader visible={logoutLoading} message="Logging out..." />
      <FullScreenLoader visible={loginLoading} message="Logging in..." />
    </NotificationProvider>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: 'white', // Will be overridden by theme
    borderTopWidth: 1,
    zIndex: 1000,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: theme.spacing.xs,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    borderRadius: 2,
  },
});

export { linking };
export default AppNavigator; 