import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, Snackbar, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, styles as globalStyles } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';
import { useThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Logo = () => {
  return (
    <View style={styles.logoCircle}>
      <Image source={require('../../../assets/mito_logo.png')} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const paperTheme = useTheme();
  const { login, loginLoading } = useAuth();
  const { toggleTheme, theme: customTheme } = useThemeContext();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      await login(email, password);
      // Navigation to main app is handled by auth state change
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An unexpected error occurred.';
      setError(
        errorMessage === 'Invalid credentials'
          ? 'Invalid email or password. Please try again.'
          : errorMessage
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: paperTheme.colors.background }} edges={Platform.OS === 'web' ? [] : ['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'web' ? undefined : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 16,
            minHeight: '100vh'
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={{ width: '100%', maxWidth: 400, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 0, elevation: 4, backgroundColor: paperTheme.colors.surface }}>
            <View style={{ alignItems: 'center', marginBottom: 18, paddingHorizontal: 18 }}>
              <Logo />
              <Text variant="headlineLarge" style={{ color: paperTheme.colors.primary, fontWeight: 'bold', marginTop: 6, fontSize: 24 }}>Welcome Back</Text>
              <Text variant="bodyLarge" style={{ color: paperTheme.colors.textSecondary, marginTop: 2, fontSize: 14 }}>Sign in to continue</Text>
            </View>
            <View style={{ gap: 12, paddingHorizontal: 18 }}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                left={<TextInput.Icon icon="email" color={paperTheme.colors.primary} />}
                placeholder="Enter your email"
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Email"
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={secureTextEntry}
                style={{ borderRadius: 12, backgroundColor: paperTheme.colors.background, fontSize: 15, height: 40 }}
                activeOutlineColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.text}
                left={<TextInput.Icon icon="lock" color={paperTheme.colors.primary} />}
                right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={() => setSecureTextEntry(!secureTextEntry)} color={paperTheme.colors.primary} accessibilityLabel="Toggle password visibility" />}
                placeholder="Enter your password"
                placeholderTextColor={paperTheme.colors.textSecondary}
                accessibilityLabel="Password"
              />
              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 }}
                textColor={paperTheme.colors.primary}
                labelStyle={{ fontSize: 13 }}
                accessibilityLabel="Forgot password"
              >
                Forgot Password?
              </Button>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={{ borderRadius: 12, marginTop: 10, height: 40, justifyContent: 'center' }}
                loading={loginLoading}
                disabled={loginLoading}
                contentStyle={{ height: 40 }}
                labelStyle={{ fontFamily: 'Roboto_500Medium', fontSize: 15 }}
                accessibilityLabel="Login"
              >
                Login
              </Button>
            </View>
            <Divider style={{ marginVertical: 16 }} />
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={{ alignSelf: 'center', justifyContent: 'center', height: 'auto', minHeight: 32, marginBottom: 12 }}
              textColor={paperTheme.colors.primary}
              labelStyle={{ fontSize: 14, lineHeight: 20, marginBottom: 12, textAlignVertical: 'center' }}
              accessibilityLabel="Go to registration"
            >
              Don't have an account? Register
            </Button>
          </Card>
          <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center', paddingHorizontal: 18, marginTop: 20 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: paperTheme.colors.text, marginRight: 8, fontSize: 14 }}>{customTheme.dark ? 'Light Mode' : 'Dark Mode'}</Text>
              <Switch value={customTheme.dark} onValueChange={toggleTheme} color={paperTheme.colors.primary} style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} />
            </View>
          </View>
          <Snackbar
            visible={!!error}
            onDismiss={() => setError("")}
            duration={4000}
            style={{ backgroundColor: paperTheme.colors.error }}
          >
            {error}
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
  },
  form: {
    gap: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  linkButton: {
    marginTop: theme.spacing.md,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  toggleContainer: {
    alignItems: 'center',
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
});

export default LoginScreen; 