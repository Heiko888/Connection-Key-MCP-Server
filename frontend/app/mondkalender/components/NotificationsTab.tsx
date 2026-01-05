import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, List, ListItem, ListItemText, ListItemIcon, Chip, IconButton, Alert, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MoonNotification } from '../moonApi';

interface NotificationsTabProps {
  userNotifications: MoonNotification[];
  onAddNotification: () => void;
}

export default function NotificationsTab({ userNotifications, onAddNotification }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<MoonNotification[]>(userNotifications);

  useEffect(() => {
    setNotifications(userNotifications);
  }, [userNotifications]);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Delete notification functionality
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Fehler beim Löschen der Benachrichtigung:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'full_moon':
        return '🌕';
      case 'new_moon':
        return '🌑';
      case 'quarter_moon':
        return '🌓';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'full_moon':
        return '#f7fafc';
      case 'new_moon':
        return '#1a1a2e';
      case 'quarter_moon':
        return '#4a5568';
      default:
        return '#718096';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'full_moon':
        return 'Vollmond';
      case 'new_moon':
        return 'Neumond';
      case 'quarter_moon':
        return 'Viertelmond';
      default:
        return 'Benutzerdefiniert';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date();
  };

  const isToday = (scheduledDate: string) => {
    const today = new Date().toDateString();
    const scheduled = new Date(scheduledDate).toDateString();
    return today === scheduled;
  };

  return (
    <motion.div
      
      
      
    >
      <Card sx={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(254,243,199,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Bell size={24} color="#fef3c7" />
              <Typography variant="h5" sx={{
                color: '#fef3c7',
                fontWeight: 700,
                ml: 2
              }}>
                Moon-Benachrichtigungen
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={onAddNotification}
              sx={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                color: '#1f2937',
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #fde68a 0%, #fef3c7 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(254,243,199,0.3)'
                }
              }}
            >
              Neue Benachrichtigung
            </Button>
          </Box>

          {/* Stats */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${notifications.length} Benachrichtigungen`}
              sx={{
                background: 'rgba(254,243,199,0.2)',
                color: '#fef3c7',
                border: '1px solid rgba(254,243,199,0.3)'
              }}
            />
            <Chip
              label={`${notifications.filter(n => !n.is_sent).length} Ausstehend`}
              icon={<Clock size={16} />}
              sx={{
                background: 'rgba(59,130,246,0.2)',
                color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.3)'
              }}
            />
            <Chip
              label={`${notifications.filter(n => n.is_sent).length} Gesendet`}
              icon={<CheckCircle size={16} />}
              sx={{
                background: 'rgba(34,197,94,0.2)',
                color: '#86efac',
                border: '1px solid rgba(34,197,94,0.3)'
              }}
            />
          </Box>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Bell size={48} color="rgba(254,243,199,0.5)" />
              <Typography sx={{
                color: 'rgba(254,243,199,0.7)',
                mt: 2,
                fontSize: '1.1rem'
              }}>
                Noch keine Benachrichtigungen
              </Typography>
              <Typography sx={{
                color: 'rgba(254,243,199,0.5)',
                mt: 1,
                fontSize: '0.9rem'
              }}>
                Erstelle deine erste Moon-Benachrichtigung
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => {
                const isOverdueNotification = isOverdue(notification.scheduled_date);
                const isTodayNotification = isToday(notification.scheduled_date);

                return (
                  <motion.div
                    key={notification.id}
                    
                    
                    
                  >
                    <ListItem
                      sx={{
                        background: isOverdueNotification 
                          ? 'rgba(239,68,68,0.1)' 
                          : isTodayNotification 
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        mb: 1,
                        border: isOverdueNotification 
                          ? '1px solid rgba(239,68,68,0.3)'
                          : isTodayNotification 
                            ? '1px solid rgba(34,197,94,0.3)'
                            : '1px solid rgba(254,243,199,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: isOverdueNotification 
                            ? 'rgba(239,68,68,0.15)' 
                            : isTodayNotification 
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(254,243,199,0.1)',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{
                          fontSize: '1.5rem',
                          filter: isOverdueNotification ? 'grayscale(0.5)' : 'none'
                        }}>
                          {getNotificationIcon(notification.notification_type)}
                        </Box>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography sx={{
                              color: '#fef3c7',
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {notification.message}
                            </Typography>
                            <Chip
                              label={getNotificationTypeLabel(notification.notification_type)}
                              size="small"
                              sx={{
                                background: `rgba(${getNotificationColor(notification.notification_type).replace('#', '')}, 0.2)`,
                                color: '#fef3c7',
                                border: `1px solid ${getNotificationColor(notification.notification_type)}`,
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                            {isOverdueNotification && (
                              <Chip
                                label="Überfällig"
                                size="small"
                                icon={<AlertCircle size={12} />}
                                sx={{
                                  background: 'rgba(239,68,68,0.2)',
                                  color: '#fca5a5',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            )}
                            {isTodayNotification && !isOverdueNotification && (
                              <Chip
                                label="Heute"
                                size="small"
                                icon={<Clock size={12} />}
                                sx={{
                                  background: 'rgba(34,197,94,0.2)',
                                  color: '#86efac',
                                  border: '1px solid rgba(34,197,94,0.3)',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography sx={{
                              color: 'rgba(254,243,199,0.7)',
                              fontSize: '0.85rem',
                              mb: 0.5
                            }}>
                              Geplant für: {formatDate(notification.scheduled_date)}
                            </Typography>
                            <Typography sx={{
                              color: 'rgba(254,243,199,0.6)',
                              fontSize: '0.8rem'
                            }}>
                              Status: {notification.is_sent ? 'Gesendet' : 'Ausstehend'}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <IconButton
                        onClick={() => handleDeleteNotification(notification.id)}
                        sx={{
                          color: 'rgba(254,243,199,0.6)',
                          '&:hover': {
                            color: '#fca5a5',
                            backgroundColor: 'rgba(239,68,68,0.1)'
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider sx={{ borderColor: 'rgba(254,243,199,0.1)', my: 1 }} />
                    )}
                  </motion.div>
                );
              })}
            </List>
          )}

          {/* Info Box */}
          <Alert
            severity="info"
            sx={{
              mt: 4,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#93c5fd',
              '& .MuiAlert-icon': {
                color: '#93c5fd'
              }
            }}
          >
            <Typography sx={{ fontSize: '0.9rem' }}>
              <strong>Moon-Benachrichtigungen</strong> helfen dir dabei, wichtige Mondphasen nicht zu verpassen. 
              Du kannst Benachrichtigungen für Vollmond, Neumond, Viertelmond oder benutzerdefinierte Termine erstellen.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}
