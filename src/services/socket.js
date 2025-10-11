import { io } from 'socket.io-client';
import config from '../config/api.config';

let socket;
let eventCallbacks = {};

export const connectSocket = (token, userId, onNotification) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Use http protocol for socket connection (Socket.IO handles the upgrade)
  let socketUrl = config.BACKEND_API_URL.replace(/\/api$/, '');
  
  socket = io(socketUrl, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    timeout: 5000,
    forceNew: true
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error);
  });

  socket.on('notification', (payload) => {
    if (onNotification) onNotification(payload);
  });

  // Task real-time events
  socket.on('task_update', (updatedTask) => {
    if (eventCallbacks.taskUpdate) {
      eventCallbacks.taskUpdate(updatedTask);
    }
  });

  socket.on('task_status_change', (data) => {
    if (eventCallbacks.taskStatusChange) {
      eventCallbacks.taskStatusChange(data);
    }
  });

  socket.on('task_assignment_change', (data) => {
    if (eventCallbacks.taskAssignmentChange) {
      eventCallbacks.taskAssignmentChange(data);
    }
  });

  socket.on('task_deleted', (data) => {
    if (eventCallbacks.taskDeleted) {
      eventCallbacks.taskDeleted(data);
    }
  });

  // Comment real-time events
  socket.on('new_comment', (comment) => {
    if (eventCallbacks.newComment) {
      eventCallbacks.newComment(comment);
    }
  });

  socket.on('comment_update', (comment) => {
    if (eventCallbacks.commentUpdate) {
      eventCallbacks.commentUpdate(comment);
    }
  });

  socket.on('comment_deleted', (data) => {
    if (eventCallbacks.commentDeleted) {
      eventCallbacks.commentDeleted(data);
    }
  });

  // Notification events
  socket.on('notification_removed', (data) => {
    if (eventCallbacks.notificationRemoved) {
      eventCallbacks.notificationRemoved(data);
    }
  });

  // Performance updates
  socket.on('performance_update', (performance) => {
    if (eventCallbacks.performanceUpdate) {
      eventCallbacks.performanceUpdate(performance);
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (err) => {
    console.log('Socket reconnection error:', err);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Event listener management
export const addSocketListener = (event, callback) => {
  eventCallbacks[event] = callback;
};

export const removeSocketListener = (event) => {
  delete eventCallbacks[event];
};

export const getSocket = () => socket; 