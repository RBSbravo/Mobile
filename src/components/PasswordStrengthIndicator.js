import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { IconButton } from 'react-native-paper';
import passwordValidator from '../utils/passwordValidator';

const PasswordStrengthIndicator = ({ password, showSuggestions = true, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const validation = passwordValidator.validate(password || '');
  const strength = validation.strength;
  const errors = validation.errors;
  const suggestions = passwordValidator.getSuggestions(errors);

  const getStrengthColor = () => {
    if (strength < 30) return '#f44336'; // Red
    if (strength < 50) return '#ff9800'; // Orange
    if (strength < 70) return '#2196f3'; // Blue
    if (strength < 90) return '#9c27b0'; // Purple
    return '#4caf50'; // Green
  };

  const getStrengthDescription = () => {
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Strong';
  };

  const getRequirements = () => [
    {
      label: 'At least 8 characters',
      met: password && password.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      met: password && /[A-Z]/.test(password)
    },
    {
      label: 'Contains lowercase letter',
      met: password && /[a-z]/.test(password)
    },
    {
      label: 'Contains number',
      met: password && /\d/.test(password)
    },
    {
      label: 'Contains special character',
      met: password && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)
    }
  ];

  if (!password) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderText}>
          Enter a password to see strength indicator
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <View style={styles.strengthHeader}>
        <View style={styles.strengthHeaderLeft}>
          <Text style={styles.strengthLabel}>Password Strength:</Text>
          <View style={[styles.strengthChip, { backgroundColor: getStrengthColor() }]}>
            <Text style={styles.strengthChipText}>{getStrengthDescription()}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Always visible strength bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${strength}%`, backgroundColor: getStrengthColor() }]} />
      </View>
      <Text style={styles.strengthPercentage}>{strength}% strength</Text>

      {/* Collapsible detailed content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Requirements Checklist */}
          <View style={styles.requirementsSection}>
            <Text style={styles.sectionTitle}>Requirements:</Text>
            {getRequirements().map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={[
                  styles.requirementIcon,
                  { backgroundColor: req.met ? '#4caf50' : '#f44336' }
                ]}>
                  <Text style={styles.requirementIconText}>
                    {req.met ? '✓' : '✗'}
                  </Text>
                </View>
                <Text style={[
                  styles.requirementText,
                  { color: req.met ? '#4caf50' : '#f44336' }
                ]}>
                  {req.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Suggestions:</Text>
              {suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <View style={styles.suggestionIcon}>
                    <Text style={styles.suggestionIconText}>!</Text>
                  </View>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 4
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  strengthSection: {
    marginBottom: 12
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  strengthHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  expandButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666'
  },
  expandedContent: {
    marginTop: 8
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8
  },
  strengthChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center'
  },
  strengthChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 4,
    overflow: 'hidden'
  },
  strengthPercentage: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right'
  },
  requirementsSection: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  requirementIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  requirementIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  requirementText: {
    fontSize: 11,
    flex: 1
  },
  suggestionsSection: {
    marginBottom: 8
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  suggestionIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  suggestionIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  suggestionText: {
    fontSize: 11,
    color: '#ff9800',
    flex: 1
  }
});

export default PasswordStrengthIndicator;
