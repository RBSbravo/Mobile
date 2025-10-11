import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      console.log('AuthContext: Starting to load user from storage');
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        console.log('AuthContext: Storage check', { hasUser: !!storedUser, hasToken: !!storedToken });
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Validate token with backend
          try {
            console.log('AuthContext: Validating token with backend');
            await api.getProfile(storedToken);
            console.log('AuthContext: Token validation successful');
          } catch (error) {
            console.log('AuthContext: Token validation failed, clearing storage');
            // Token is invalid, clear storage
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } else {
          console.log('AuthContext: No stored credentials found');
        }
      } catch (e) {
        console.error('AuthContext: Failed to load user from storage', e);
      } finally {
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('AuthContext: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    loadUserFromStorage().finally(() => {
      clearTimeout(timeoutId);
    });
  }, []);

  const login = async (email, password) => {
    setLoginLoading(true);
    try {
      const response = await api.login(email, password);
      const { user: userData, token: authToken } = response;
      
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', authToken);
      
      setUser(userData);
      setToken(authToken);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      const { user: newUser } = response;
      // Do not store user/token or setUser/setToken here
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear local storage and state
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setLogoutLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.getProfile(token);
      const newUserData = { ...user, ...updatedUser };
      
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      return newUserData;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await api.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      return await api.resetPassword(resetToken, newPassword);
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  const verifyResetToken = async (resetToken) => {
    try {
      return await api.verifyResetToken(resetToken);
    } catch (error) {
      console.error('Verify reset token failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      logoutLoading,
      loginLoading, 
      login, 
      register,
      logout, 
      updateProfile,
      forgotPassword,
      resetPassword,
      verifyResetToken,
      isAuthenticated: !!user && !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 