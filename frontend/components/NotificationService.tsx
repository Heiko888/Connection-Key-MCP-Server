"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton, Box, Typography } from '@mui/material';
import { X, Bell, Heart, Moon, Star, Users, Calendar, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'match' | 'moon' | 'daily' | 'community';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'match':
      return <Heart size={20} />;
    case 'moon':
      return <Moon size={20} />;
    case 'daily':
      return <Star size={20} />;
    case 'community':
      return <Users size={20} />;
    case 'success':
      return <Zap size={20} />;
    default:
      return <Bell size={20} />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'match':
      return '#ef4444';
    case 'moon':
      return '#8b5cf6';
    case 'daily':
      return '#f59e0b';
    case 'community':
      return '#10b981';
    case 'success':
      return '#22c55e';
    case 'warning':
      return '#f59e0b';
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('hd-app-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('hd-app-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

    // Show browser notification if permission granted
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  // Daily notification scheduler
  useEffect(() => {
    const scheduleDailyNotifications = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM

      const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
        addNotification({
          type: 'daily',
          title: '🌅 Tägliche Energie',
          message: 'Deine persönliche Human Design Energie für heute ist bereit!',
        });

        // Schedule next day
        scheduleDailyNotifications();
      }, timeUntilTomorrow);
    };

    scheduleDailyNotifications();
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    requestPermission,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
};

const NotificationDisplay: React.FC = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const unread = notifications.find(n => !n.read);
      if (unread) {
        setCurrentNotification(unread);
        setOpen(true);
      }
    }
  }, [notifications]);

  const handleClose = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setOpen(false);
    setCurrentNotification(null);
  };

  const handleAction = () => {
    if (currentNotification?.action) {
      currentNotification.action.onClick();
    }
    handleClose();
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={currentNotification.type === 'error' ? 'error' : 'info'}
        onClose={handleClose}
        sx={{
          minWidth: 300,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          border: `2px solid ${getNotificationColor(currentNotification.type)}`,
        }}
        icon={
          <Box sx={{ color: getNotificationColor(currentNotification.type) }}>
            {getNotificationIcon(currentNotification.type)}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {currentNotification.action && (
              <IconButton
                size="small"
                onClick={handleAction}
                sx={{ color: 'primary.main' }}
              >
                {currentNotification.action.label}
              </IconButton>
            )}
            <IconButton size="small" onClick={handleClose}>
              <X size={16} />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
          {currentNotification.title}
        </AlertTitle>
        <Typography variant="body2">
          {currentNotification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default NotificationProvider;
