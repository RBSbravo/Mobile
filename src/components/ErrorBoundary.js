import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.errorCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <MaterialIcons 
            name="error-outline" 
            size={64} 
            color={theme.colors.error} 
            style={styles.icon}
          />
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.text }]}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.textSecondary }]}>
            The app encountered an unexpected error. Please try again.
          </Text>
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text variant="bodySmall" style={[styles.debugText, { color: theme.colors.textSecondary }]}>
                {error && error.toString()}
              </Text>
            </View>
          )}
          <Button 
            mode="contained" 
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            icon="refresh"
          >
            Try Again
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  debugInfo: {
    width: '100%',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default ErrorBoundary;
