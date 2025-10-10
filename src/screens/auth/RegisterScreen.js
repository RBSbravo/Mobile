import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Image, Modal, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, Snackbar, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme as customTheme, styles as globalStyles } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useThemeContext } from '../../context/ThemeContext';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';

const { width } = Dimensions.get('window');

const Logo = () => {
  return (
    <View style={styles.logoCircle}>
      <Image source={require('../../../assets/mito_logo.png')} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const paperTheme = useTheme();
  const { register } = useAuth();
  const { toggleTheme, theme: customTheme } = useThemeContext();

  useEffect(() => {
    // Fetch departments from backend
    const fetchDepartments = async () => {
      try {
        const data = await api.getDepartments();
        setDepartments(data);
        setError(''); // Clear any previous error
      } catch (error) {
        setError('Failed to load departments: ' + (error.message || error.toString()));
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.length < 1 || formData.firstname.length > 50) {
      newErrors.firstname = 'First name must be between 1 and 50 characters';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (formData.lastname.length < 1 || formData.lastname.length > 50) {
      newErrors.lastname = 'Last name must be between 1 and 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      // Always register as employee
      const registrationData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'employee',
        departmentId: formData.departmentId
      };
      await register(registrationData);
      // Registration successful - clear form, show success, show loading, redirect to login after delay
      setFormData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '', departmentId: '' });
      setError("");
      setErrors({});
      setSuccess(true);
      setLoading(true); // keep loading true during delay
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        navigation.navigate('Login');
      }, 1500);
      return;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSelectedDepartmentName = () => {
    const dept = departments.find(d => d.id === formData.departmentId);
    return dept ? dept.name : 'Select Department';
  };

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(departmentSearch.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 16, flexGrow: 1 }}>
          <View style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 0,
            elevation: 4,
            backgroundColor: paperTheme.colors.surface,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 18, paddingHorizontal: 18 }}>
              <Logo />
              <Text variant="headlineLarge" style={{ color: paperTheme.colors.primary, fontWeight: 'bold', marginTop: 6, fontSize: 24 }}>Create Account</Text>
              <Text variant="bodyLarge" style={{ color: paperTheme.colors.textSecondary, marginTop: 2, fontSize: 14 }}>Get started with your new account</Text>
            </View>
            <View style={{ gap: 12, paddingHorizontal: 18, paddingBottom: 8 }}>
              <TextInput
                label="First Name"
                value={formData.firstname}
                onChangeText={(value) => handleInputChange('firstname', value)}
                mode="outlined"
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                error={!!errors.firstname}
                left={<TextInput.Icon icon="account" color={paperTheme.colors.primary} />}
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="First Name"
              />
              {errors.firstname && <HelperText type="error" visible={!!errors.firstname}>{errors.firstname}</HelperText>}
              <TextInput
                label="Last Name"
                value={formData.lastname}
                onChangeText={(value) => handleInputChange('lastname', value)}
                mode="outlined"
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                error={!!errors.lastname}
                left={<TextInput.Icon icon="account" color={paperTheme.colors.primary} />}
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Last Name"
              />
              {errors.lastname && <HelperText type="error" visible={!!errors.lastname}>{errors.lastname}</HelperText>}
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                error={!!errors.email}
                left={<TextInput.Icon icon="email" color={paperTheme.colors.primary} />}
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Email"
              />
              {errors.email && <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>}
              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                mode="outlined"
                secureTextEntry={secureTextEntry}
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" color={paperTheme.colors.primary} />}
                right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={() => setSecureTextEntry(!secureTextEntry)} color={paperTheme.colors.primary} accessibilityLabel="Toggle password visibility" />}
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Password"
              />
              {errors.password && <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>}
              <PasswordStrengthIndicator password={formData.password} />
              <TextInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                mode="outlined"
                secureTextEntry={confirmSecureTextEntry}
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock" color={paperTheme.colors.primary} />}
                right={<TextInput.Icon icon={confirmSecureTextEntry ? "eye" : "eye-off"} onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)} color={paperTheme.colors.primary} accessibilityLabel="Toggle confirm password visibility" />}
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Confirm Password"
              />
              {errors.confirmPassword && <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword}</HelperText>}
              {/* Department Selection - Optimized UI */}
              <TouchableOpacity onPress={() => setDepartmentModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label="Department"
                  value={getSelectedDepartmentName()}
                  mode="outlined"
                  editable={false}
                  style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                  activeOutlineColor={paperTheme.colors.primary}
                  textColor={paperTheme.colors.text}
                  error={!!errors.departmentId}
                  left={<TextInput.Icon icon="office-building" color={paperTheme.colors.primary} />}
                  pointerEvents="none"
                  accessibilityLabel="Department"
                />
              </TouchableOpacity>
              {errors.departmentId && <HelperText type="error" visible={!!errors.departmentId}>{errors.departmentId}</HelperText>}
            </View>
          </View>
          {/* Department Picker Modal */}
          <Modal
            visible={departmentModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setDepartmentModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: paperTheme.colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' }}>
                <View style={{ padding: 12, borderBottomWidth: 1, borderColor: paperTheme.colors.border }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: paperTheme.colors.text }}>Select Department</Text>
                  <TextInput
                    placeholder="Search department..."
                    value={departmentSearch}
                    onChangeText={setDepartmentSearch}
                    mode="flat"
                    style={{ marginTop: 6, backgroundColor: paperTheme.colors.surface, fontSize: 15, height: 36 }}
                    textColor={paperTheme.colors.text}
                    left={<TextInput.Icon icon="magnify" color={paperTheme.colors.primary} />}
                  />
                </View>
                <FlatList
                  data={filteredDepartments}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleInputChange('departmentId', item.id);
                        setDepartmentModalVisible(false);
                        setDepartmentSearch("");
                      }}
                      style={{
                        padding: 12,
                        backgroundColor: formData.departmentId === item.id ? paperTheme.colors.primary + '22' : paperTheme.colors.background
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                    >
                      <Text style={{ color: paperTheme.colors.text, fontWeight: formData.departmentId === item.id ? 'bold' : 'normal', fontSize: 15 }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={{ padding: 12, color: paperTheme.colors.textSecondary, fontSize: 14 }}>No departments found.</Text>}
                  style={{ maxHeight: 200 }}
                />
                <Button onPress={() => setDepartmentModalVisible(false)}
                  style={{ margin: 12, height: 'auto', minHeight: 36, borderRadius: 12 }} mode="outlined" labelStyle={{ fontSize: 15, lineHeight: 22, textAlignVertical: 'center' }}>Cancel</Button>
              </View>
            </View>
          </Modal>
          <Snackbar
            visible={!!error || success}
            onDismiss={() => { setError(""); setSuccess(false); }}
            duration={success ? 1500 : 4000}
            style={{ backgroundColor: success ? paperTheme.colors.success : paperTheme.colors.error }}
          >
            {success ? 'Registration successful! Redirecting to login...' : error}
          </Snackbar>
          {(loading && success) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
              <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
          ) : (
            <>
          {/* Fixed action buttons and theme toggle at the bottom */}
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', paddingHorizontal: 18, marginTop: 12 }}>
            <Button
              mode="contained"
              onPress={handleRegister}
              style={{ borderRadius: 12, marginTop: 6, height: 40, justifyContent: 'center' }}
              loading={loading}
              disabled={loading}
              contentStyle={{ height: 40 }}
              labelStyle={{ fontFamily: 'Roboto_500Medium', fontSize: 15 }}
              accessibilityLabel="Register"
            >
              Register
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={{ alignSelf: 'center', marginTop: 8, marginBottom: 5, justifyContent: 'center', height: 'auto', minHeight: 32 }}
              textColor={paperTheme.colors.primary}
              labelStyle={{ fontSize: 14, lineHeight: 20 }}
              accessibilityLabel="Go to login"
            >
              Already have an account? Login
            </Button>
            <View style={{ marginTop: 0, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: paperTheme.colors.text, marginRight: 8, fontSize: 14 }}>{customTheme.dark ? 'Light Mode' : 'Dark Mode'}</Text>
              <Switch value={customTheme.dark} onValueChange={toggleTheme} color={paperTheme.colors.primary} style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} />
            </View>
          </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: customTheme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: customTheme.spacing.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: customTheme.spacing.xl,
    alignSelf: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: customTheme.spacing.xl,
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    marginBottom: customTheme.spacing.sm,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
  },
  form: {
    gap: customTheme.spacing.md,
  },
  input: {
    backgroundColor: customTheme.colors.surface,
  },
  registerButton: {
    marginTop: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.xl,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  linkButton: {
    marginTop: customTheme.spacing.md,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: customTheme.spacing.md,
    backgroundColor: 'transparent',
  },
});

export default RegisterScreen; 