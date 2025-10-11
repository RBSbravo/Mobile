import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Card, Button, Avatar, useTheme, Dialog, Portal, ActivityIndicator, Title, Caption, TouchableRipple, Switch, Snackbar, TextInput, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, styles as globalStyles } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import passwordValidator from '../../utils/passwordValidator';

const ProfileScreen = ({ navigation }) => {
  const paperTheme = useTheme();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token, loading: authLoading, logout, updateProfile } = useAuth();
  const { toggleTheme } = useThemeContext();
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState("");
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const { setupPerformanceUpdates, cleanupListeners } = useRealtimeUpdates();

  // Real-time updates for profile
  useEffect(() => {
    const handlePerformanceUpdate = (performance) => {
      // Refresh profile data when performance metrics change
      // This could trigger a profile refresh if needed
    };

    setupPerformanceUpdates(handlePerformanceUpdate);

    return () => {
      cleanupListeners();
    };
  }, [setupPerformanceUpdates, cleanupListeners]);

  // Refresh profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Refresh user profile data if needed
      if (user && token) {
        // Could fetch updated profile data here
      }
    }, [user, token])
  );

  useEffect(() => {
    let timeout;
    if (authLoading || loading) {
      timeout = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timeout);
  }, [authLoading, loading]);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    logout();
  };

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editForm, setEditForm] = useState({ firstname: '', lastname: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const handleEditProfile = async () => {
    // Initialize form with current user data
    setEditForm({
      firstname: user?.firstname || user?.firstName || '',
      lastname: user?.lastname || user?.lastName || '',
      email: user?.email || ''
    });
    setEditError('');
    setEditSuccess('');
    setEditProfileVisible(true);
  };

  const validateEditForm = () => {
    if (!editForm.firstname?.trim()) {
      return 'First name is required.';
    }
    if (!editForm.lastname?.trim()) {
      return 'Last name is required.';
    }
    if (!editForm.email?.trim()) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleUpdateProfile = async () => {
    setEditError('');
    setEditSuccess('');
    
    const validationError = validateEditForm();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);
    try {
      await api.updateProfile(token, user.id, {
        firstname: editForm.firstname.trim(),
        lastname: editForm.lastname.trim(),
        email: editForm.email.trim()
      });
      
      // Update the user context with new data
      await updateProfile({
        ...user,
        firstname: editForm.firstname.trim(),
        lastName: editForm.lastname.trim(),
        email: editForm.email.trim()
      });
      
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setEditProfileVisible(false);
        setEditSuccess('');
      }, 2000);
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const validatePasswordForm = () => {
    if (!pwForm.current) {
      return 'Current password is required.';
    }
    if (!pwForm.next) {
      return 'New password is required.';
    }
    // Use the new password validator
    const passwordValidation = passwordValidator.validate(pwForm.next);
    if (!passwordValidation.isValid) {
      return passwordValidation.errors[0];
    }
    if (!pwForm.confirm) {
      return 'Please confirm your new password.';
    }
    if (pwForm.next !== pwForm.confirm) {
      return 'New passwords do not match.';
    }
    if (pwForm.current === pwForm.next) {
      return 'New password must be different from current password.';
    }
    return null;
  };

  const handleChangePw = async () => {
    setPwError('');
    setPwSuccess('');
    
    const validationError = validatePasswordForm();
    if (validationError) {
      setPwError(validationError);
      return;
    }

    setPwLoading(true);
    try {
      await api.changePassword(token, pwForm.current, pwForm.next);
      setPwSuccess('Password changed successfully! You will be logged out for security.');
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPasswords({ current: false, next: false, confirm: false });
      
      // Show logout loading state after 2 seconds
      setTimeout(() => {
        setPwSuccess('');
        setChangePwVisible(false);
        logout();
      }, 2000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setPwForm({ current: '', next: '', confirm: '' });
    setPwError('');
    setPwSuccess('');
    setShowPasswords({ current: false, next: false, confirm: false });
    setLogoutLoading(false);
  };

  const handleCloseModal = () => {
    if (!pwLoading) {
      resetPasswordForm();
      setChangePwVisible(false);
    }
  };

  if (showSpinner) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <Portal>
        <Dialog 
          visible={logoutDialogVisible} 
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: paperTheme.colors.surface }}
        >
          <Dialog.Title style={{ color: paperTheme.colors.text }}>Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: paperTheme.colors.text }}>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} textColor={paperTheme.colors.primary}>Cancel</Button>
            <Button onPress={handleLogout} loading={loading} disabled={loading} textColor={paperTheme.colors.primary}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog 
          visible={changePwVisible} 
          onDismiss={handleCloseModal} 
          style={{ backgroundColor: paperTheme.colors.surface }}
        >
          <Dialog.Title style={{ color: paperTheme.colors.text, fontSize: 18, fontWeight: 'bold' }}>
            Change Password
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: paperTheme.colors.textSecondary, marginBottom: 16, fontSize: 14 }}>
              Enter your current password and choose a new password. You will be logged out after the change for security.
            </Text>
            
            <Text style={{ color: paperTheme.colors.text, fontWeight: '600', marginBottom: 8 }}>Current Password</Text>
            <TextInput
              value={pwForm.current}
              onChangeText={v => setPwForm(f => ({ ...f, current: v }))}
              secureTextEntry={!showPasswords.current}
              style={{ 
                marginBottom: 16, 
                backgroundColor: paperTheme.colors.surface,
                borderWidth: 1,
                borderColor: paperTheme.colors.border
              }}
              right={
                <TextInput.Icon 
                  icon={showPasswords.current ? "eye-off" : "eye"} 
                  onPress={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                />
              }
              disabled={pwLoading}
            />

            <Text style={{ color: paperTheme.colors.text, fontWeight: '600', marginBottom: 8 }}>New Password</Text>
            <TextInput
              value={pwForm.next}
              onChangeText={v => setPwForm(f => ({ ...f, next: v }))}
              secureTextEntry={!showPasswords.next}
              style={{ 
                marginBottom: 16, 
                backgroundColor: paperTheme.colors.surface,
                borderWidth: 1,
                borderColor: paperTheme.colors.border
              }}
              right={
                <TextInput.Icon 
                  icon={showPasswords.next ? "eye-off" : "eye"} 
                  onPress={() => setShowPasswords(s => ({ ...s, next: !s.next }))}
                />
              }
              disabled={pwLoading}
            />
            <HelperText type="info" visible={true}>
              Password must meet security requirements (8+ chars, uppercase, lowercase, number, special char)
            </HelperText>
            
            <PasswordStrengthIndicator password={pwForm.next} />

            <Text style={{ color: paperTheme.colors.text, fontWeight: '600', marginBottom: 8 }}>Confirm New Password</Text>
            <TextInput
              value={pwForm.confirm}
              onChangeText={v => setPwForm(f => ({ ...f, confirm: v }))}
              secureTextEntry={!showPasswords.confirm}
              style={{ 
                marginBottom: 16, 
                backgroundColor: paperTheme.colors.surface,
                borderWidth: 1,
                borderColor: paperTheme.colors.border
              }}
              right={
                <TextInput.Icon 
                  icon={showPasswords.confirm ? "eye-off" : "eye"} 
                  onPress={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                />
              }
              disabled={pwLoading}
            />

            {!!pwError && (
              <HelperText type="error" visible={true} style={{ marginTop: 8 }}>
                {pwError}
              </HelperText>
            )}
            
            {!!pwSuccess && (
              <HelperText type="info" visible={true} style={{ marginTop: 8, color: paperTheme.colors.primary }}>
                {pwSuccess}
              </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button 
              onPress={handleCloseModal} 
              disabled={pwLoading}
              textColor={paperTheme.colors.primary}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleChangePw} 
              loading={pwLoading} 
              disabled={pwLoading} 
              mode="contained"
              style={{ backgroundColor: paperTheme.colors.primary }}
            >
              Change Password
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog visible={editProfileVisible} onDismiss={() => setEditProfileVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="First Name"
              value={editForm.firstname}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, firstname: text }))}
              mode="outlined"
              style={{ marginBottom: 16 }}
              disabled={editLoading}
            />
            <TextInput
              label="Last Name"
              value={editForm.lastname}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, lastname: text }))}
              mode="outlined"
              style={{ marginBottom: 16 }}
              disabled={editLoading}
            />
            <TextInput
              label="Email"
              value={editForm.email}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ marginBottom: 16 }}
              disabled={editLoading}
            />
            {editError ? (
              <HelperText type="error" visible={!!editError}>
                {editError}
              </HelperText>
            ) : null}
            {editSuccess ? (
              <HelperText type="info" visible={!!editSuccess}>
                {editSuccess}
              </HelperText>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditProfileVisible(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button 
              onPress={handleUpdateProfile} 
              disabled={editLoading} 
              mode="contained"
              style={{ backgroundColor: paperTheme.colors.primary }}
            >
              {editLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Update Profile'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={[styles.header, styles.centeredHeader, styles.headerShadow, { borderBottomColor: paperTheme.colors.border, backgroundColor: paperTheme.colors.background }]}>
        <Avatar.Text 
          size={80} 
          label={user?.firstname ? user.firstname.charAt(0) : ''} 
          style={{ backgroundColor: paperTheme.colors.primary }}
        />
        <View style={{ marginLeft: 20 }}>
          <Title style={[styles.title, { color: paperTheme.colors.text }]}>
            {user?.firstname || ''} {user?.lastname || ''}
          </Title>
          <Caption style={[styles.caption, { color: paperTheme.colors.textSecondary }]}>{user?.email || ''}</Caption>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'ios' ? 90 : 70 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.section}>
          <Card style={[styles.infoCard, { backgroundColor: paperTheme.colors.surface, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]}>
            <Card.Content>
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={24} color={paperTheme.colors.primary} />
                <Text style={[styles.infoText, { color: paperTheme.colors.text }]}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="business" size={24} color={paperTheme.colors.primary} />
                <Text style={[styles.infoText, { color: paperTheme.colors.text }]}>
                  Department: {user.department || user.departmentId || 'Not set'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.section}>
          <Button mode="contained" onPress={handleEditProfile} style={[styles.button, { backgroundColor: paperTheme.colors.primary }]} icon="pencil">Edit Profile</Button>
          <Button mode="outlined" onPress={() => setLogoutDialogVisible(true)} style={[styles.button, { borderColor: paperTheme.colors.primary }]} textColor={paperTheme.colors.primary} icon="logout">Logout</Button>
          <Button mode="outlined" onPress={() => setChangePwVisible(true)} style={[styles.button, { borderColor: paperTheme.colors.primary }]} textColor={paperTheme.colors.primary} icon="lock">Change Password</Button>
        </View>
        <View style={styles.section}>
          <TouchableRipple onPress={toggleTheme}>
            <View style={styles.menuItem}>
              <Text style={[styles.menuItemText, { color: paperTheme.colors.text }]}>Dark Mode</Text>
              <Switch value={paperTheme.dark} onValueChange={toggleTheme} />
            </View>
          </TouchableRipple>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  caption: {
    fontFamily: theme.typography.fontFamily.regular,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    borderRadius: theme.borderRadius.default,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
  },
  button: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.default,
  },
  centeredHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerShadow: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
});

export default ProfileScreen; 