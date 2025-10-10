import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { addSocketListener, removeSocketListener, getSocket } from '../services/socket';

export const useRealtimeUpdates = () => {
  const { user, token } = useAuth();

  const setupTaskUpdates = useCallback((onTaskUpdate, onTaskStatusChange, onTaskAssignment, onTaskDeleted) => {
    if (getSocket()) {
      if (onTaskUpdate) {
        addSocketListener('taskUpdate', onTaskUpdate);
      }
      if (onTaskStatusChange) {
        addSocketListener('taskStatusChange', onTaskStatusChange);
      }
      if (onTaskAssignment) {
        addSocketListener('taskAssignmentChange', onTaskAssignment);
      }
      if (onTaskDeleted) {
        addSocketListener('taskDeleted', onTaskDeleted);
      }
    }
  }, []);

  const setupCommentUpdates = useCallback((onNewComment, onCommentUpdate, onCommentDeleted) => {
    if (getSocket()) {
      if (onNewComment) {
        addSocketListener('newComment', onNewComment);
      }
      if (onCommentUpdate) {
        addSocketListener('commentUpdate', onCommentUpdate);
      }
      if (onCommentDeleted) {
        addSocketListener('commentDeleted', onCommentDeleted);
      }
    }
  }, []);

  const setupNotificationUpdates = useCallback((onNotificationRemoved) => {
    if (getSocket()) {
      if (onNotificationRemoved) {
        addSocketListener('notificationRemoved', onNotificationRemoved);
      }
    }
  }, []);

  const setupPerformanceUpdates = useCallback((onPerformanceUpdate) => {
    if (getSocket()) {
      if (onPerformanceUpdate) {
        addSocketListener('performanceUpdate', onPerformanceUpdate);
      }
    }
  }, []);

  const cleanupListeners = useCallback(() => {
    removeSocketListener('taskUpdate');
    removeSocketListener('taskStatusChange');
    removeSocketListener('taskAssignmentChange');
    removeSocketListener('taskDeleted');
    removeSocketListener('newComment');
    removeSocketListener('commentUpdate');
    removeSocketListener('commentDeleted');
    removeSocketListener('notificationRemoved');
    removeSocketListener('performanceUpdate');
  }, []);

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return {
    setupTaskUpdates,
    setupCommentUpdates,
    setupNotificationUpdates,
    setupPerformanceUpdates,
    cleanupListeners,
    isConnected: !!getSocket()
  };
}; 