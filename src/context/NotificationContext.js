import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  const refreshUnreadCount = useCallback(async () => {
    if (user?.id && token) {
      try {
        const res = await api.getNotifications(token);
        const count = Array.isArray(res) ? res.filter(n => !n.isRead).length : 0;
        setUnreadCount(count);
      } catch (error) {
        setUnreadCount(0);
      }
    } else {
      setUnreadCount(0);
    }
  }, [user, token]);

  // Cleanup real-time notifications periodically to prevent accumulation
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setRealtimeNotifications(prev => {
        // Keep only notifications from the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return prev.filter(notification => {
          const notificationDate = new Date(notification.date);
          return notificationDate > oneDayAgo;
        });
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Real-time notification connection
  useEffect(() => {
    if (user?.id && token) {
      const handleNotification = (notif) => {
        // Ensure the notification has proper structure without duplication
        let title = notif.title || notif.data?.title || '';
        let message = notif.message || notif.data?.message || '';
        
        // If we have both title and message, use them as is
        // If we only have one of them, use it for both to avoid duplication
        if (title && message) {
          // Both exist, use them as is
        } else if (title && !message) {
          // Only title exists, use it for both
          message = title;
        } else if (!title && message) {
          // Only message exists, use it for both
          title = message;
        } else {
          // Neither exists, use fallback
          title = 'New notification';
          message = 'You have a new notification';
        }
        
        const notification = {
          id: notif.id || notif.data?.id || Date.now(),
          title: title,
          message: message,
          type: notif.type || notif.data?.type || 'system',
          isRead: false,
          date: notif.date || notif.data?.date || new Date().toISOString(),
          taskId: notif.taskId || notif.data?.taskId,
          ticketId: notif.ticketId || notif.data?.ticketId
        };
        
        setRealtimeNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
      const socket = connectSocket(token, user.id, handleNotification);
      return () => {
        disconnectSocket();
      };
    }
  }, [user, token]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount, realtimeNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext); 