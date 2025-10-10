import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image } from 'react-native';
import { Text, TextInput, Button, useTheme, Snackbar, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, styles as globalStyles } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Logo = () => {
  return (
    <View style={styles.logoCircle}>
      <Image source={require('../../../assets/mito_logo.png')} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const paperTheme = useTheme();
  const { forgotPassword } = useAuth();
  const { theme: customTheme } = useThemeContext();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await forgotPassword(email);
      setSuccessMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      setSuccess(true);
    } catch (error) {
      const errorMessage = error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <Card style={{ width: '100%', maxWidth: 400, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 0, elevation: 4, backgroundColor: paperTheme.colors.surface }}>
              <View style={{ alignItems: 'center', marginBottom: 18, paddingHorizontal: 18 }}>
                <Logo />
                <Text variant="headlineLarge" style={{ color: paperTheme.colors.primary, fontWeight: 'bold', marginTop: 6, fontSize: 24 }}>Check Your Email</Text>
                <Text variant="bodyLarge" style={{ color: paperTheme.colors.textSecondary, marginTop: 2, fontSize: 14, textAlign: 'center' }}>
                  We've sent password reset instructions to:
                </Text>
                <Text style={{ color: paperTheme.colors.primary, fontWeight: '600', marginTop: 8, fontSize: 14 }}>
                  {email}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 18 }}>
                <Text style={{ color: paperTheme.colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                  {successMessage}
                </Text>
                <Text style={{ color: paperTheme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' }}>
                  Note: The reset link will open in your web browser. You can complete the password reset there.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleBackToLogin}
                  style={{ borderRadius: 12, height: 40, justifyContent: 'center' }}
                  contentStyle={{ height: 40 }}
                  labelStyle={{ fontFamily: 'Roboto_500Medium', fontSize: 15 }}
                  accessibilityLabel="Back to login"
                >
                  Back to Login
                </Button>
              </View>
            </Card>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 400, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 0, elevation: 4, backgroundColor: paperTheme.colors.surface }}>
            <View style={{ alignItems: 'center', marginBottom: 18, paddingHorizontal: 18 }}>
              <Logo />
              <Text variant="headlineLarge" style={{ color: paperTheme.colors.primary, fontWeight: 'bold', marginTop: 6, fontSize: 24 }}>Forgot Password</Text>
              <Text variant="bodyLarge" style={{ color: paperTheme.colors.textSecondary, marginTop: 2, fontSize: 14, textAlign: 'center' }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>
              <Text style={{ color: paperTheme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                The reset link will open in your web browser for security.
              </Text>
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
                disabled={loading}
              />
              <Button
                mode="contained"
                onPress={handleForgotPassword}
                style={{ borderRadius: 12, marginTop: 10, height: 40, justifyContent: 'center' }}
                loading={loading}
                disabled={loading}
                contentStyle={{ height: 40 }}
                labelStyle={{ fontFamily: 'Roboto_500Medium', fontSize: 15 }}
                accessibilityLabel="Send reset email"
              >
                Send Reset Email
              </Button>
              <Button
                mode="text"
                onPress={handleBackToLogin}
                style={{ alignSelf: 'center', justifyContent: 'center', height: 'auto', minHeight: 32, marginTop: 8 }}
                textColor={paperTheme.colors.primary}
                labelStyle={{ fontSize: 14, lineHeight: 20, textAlignVertical: 'center' }}
                accessibilityLabel="Back to login"
              >
                Back to Login
              </Button>
            </View>
          </Card>
          <Snackbar
            visible={!!error}
            onDismiss={() => setError("")}
            duration={4000}
            style={{ backgroundColor: paperTheme.colors.error }}
          >
            {error}
          </Snackbar>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
    alignSelf: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ForgotPasswordScreen; 