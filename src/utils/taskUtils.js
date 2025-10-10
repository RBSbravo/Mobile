// taskUtils.js
// Utility functions for task-related logic, such as color mapping and date formatting.
// These are used by TaskItem and other task-related components.

/**
 * Returns the color for a given task status.
 * @param {string} status - The status of the task.
 * @param {object} paperTheme - The theme object from useTheme().
 * @returns {string} - The color string.
 */
export function getStatusColor(status, paperTheme) {
  switch ((status || '').toLowerCase()) {
    case 'in progress':
    case 'in_progress':
      return paperTheme.colors.primary;
    case 'completed':
      return paperTheme.colors.success;
    case 'pending':
      return paperTheme.colors.warning;
    case 'declined':
      return paperTheme.colors.error;
    default:
      return paperTheme.colors.textSecondary;
  }
}

/**
 * Returns the color for a given task priority.
 * @param {string} priority - The priority of the task.
 * @param {object} paperTheme - The theme object from useTheme().
 * @returns {string} - The color string.
 */
export function getPriorityColor(priority, paperTheme) {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return paperTheme.colors.error;
    case 'medium':
      return paperTheme.colors.accent;
    case 'low':
      return paperTheme.colors.success;
    default:
      return paperTheme.colors.textSecondary;
  }
}

/**
 * Formats a date string into a readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date.
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats a date string into a detailed readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date.
 */
export function formatDetailedDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a date string with time into a readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date and time.
 */
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${dateStr} at ${timeStr}`;
} 