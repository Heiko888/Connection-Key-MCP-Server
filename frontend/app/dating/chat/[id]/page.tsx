"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { 
  Send, 
  ArrowLeft, 
  Heart, 
  Phone, 
  Video,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import PageLayout from '../../../components/PageLayout';
import { supabase } from '@/lib/supabase/client';
import { Alert } from '@mui/material';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
  type: 'text' | 'image' | 'emoji';
}

interface ChatUser {
  id: string;
  name: string;
  age: number;
  image: string;
  hd_type: string;
  profile: string;
  isOnline: boolean;
  lastSeen: string;
}

export default function DatingChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // TODO: ERSETZEN DURCH API-CALL - Chat-System implementieren
  // Siehe: SYSTEMBEREINIGUNG-UND-PLAN.md - Priorität 1
  // API-Route: /api/chat/[chatId] und /api/chat/[chatId]/messages
  // Mock User Data
  const mockUser: ChatUser = {
    id: chatId,
    name: 'Sarah',
    age: 28,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    hd_type: 'Manifestor',
    profile: '2/4',
    isOnline: true,
    lastSeen: 'vor 2 Minuten'
  };

  // TODO: ERSETZEN DURCH API-CALL - Chat-System implementieren
  // Mock Messages
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hey! Wie geht es dir heute? 😊',
      sender: 'them',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text'
    },
    {
      id: '2',
      text: 'Hallo! Mir geht es super, danke! Und dir?',
      sender: 'me',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      type: 'text'
    },
    {
      id: '3',
      text: 'Auch gut! Ich habe gesehen, dass du auch Manifestor bist - das ist cool! 🌟',
      sender: 'them',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'text'
    },
    {
      id: '4',
      text: 'Ja, das stimmt! Ich finde es spannend, wie sich unsere Energien ergänzen.',
      sender: 'me',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 3 * 60 * 1000),
      type: 'text'
    },
    {
      id: '5',
      text: 'Sollten wir uns mal treffen? Ich würde gerne mehr über dein Human Design erfahren! 💫',
      sender: 'them',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text'
    }
  ];

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lade Chat-Details und User-Informationen
        const chatResponse = await fetch(`/api/chat/${chatId}`);
        if (!chatResponse.ok) {
          throw new Error('Chat nicht gefunden');
        }
        const chatData = await chatResponse.json();
        
        if (!chatData.success) {
          throw new Error(chatData.error || 'Fehler beim Laden des Chats');
        }

        // Setze User-Daten
        setUser({
          id: chatData.user.id,
          name: chatData.user.name,
          age: chatData.user.age || 0,
          image: chatData.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatData.user.name)}&background=F29F05&color=fff&size=200`,
          hd_type: chatData.user.hd_type || 'Unbekannt',
          profile: chatData.user.profile || '',
          isOnline: false, // TODO: Online-Status implementieren
          lastSeen: 'vor kurzem'
        });

        // Lade Nachrichten
        const messagesResponse = await fetch(`/api/chat/${chatId}/messages?limit=50`);
        if (!messagesResponse.ok) {
          throw new Error('Fehler beim Laden der Nachrichten');
        }
        const messagesData = await messagesResponse.json();
        
        if (messagesData.success) {
          setMessages(messagesData.messages);
        } else {
          // Fallback auf Mock-Daten, wenn keine Nachrichten vorhanden
          setMessages([]);
        }

      } catch (err: any) {
        console.error('Fehler beim Laden des Chats:', err);
        setError(err.message || 'Fehler beim Laden des Chats');
        // Fallback auf Mock-Daten für Demo
        setUser(mockUser);
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageText = newMessage.trim();
      setNewMessage(''); // Sofort leeren für bessere UX

      // Optimistic Update: Zeige Nachricht sofort an
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        text: messageText,
        sender: 'me',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Sende Nachricht an API
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageText,
          messageType: 'text'
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Senden der Nachricht');
      }

      const data = await response.json();
      
      if (data.success && data.message) {
        // Ersetze optimistische Nachricht durch echte
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? data.message : msg
          )
        );
      } else {
        // Bei Fehler: Entferne optimistische Nachricht
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        setNewMessage(messageText); // Stelle Text wieder her
        setError('Fehler beim Senden der Nachricht');
      }

    } catch (err: any) {
      console.error('Fehler beim Senden der Nachricht:', err);
      setError(err.message || 'Fehler beim Senden der Nachricht');
      // Entferne optimistische Nachricht bei Fehler
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      setNewMessage(newMessage); // Stelle Text wieder her
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={70}
            thickness={4}
            sx={{
              color: '#F29F05',
              mb: 2,
            }}
          />
          <Typography variant="h5" sx={{ 
            color: 'white',
            fontWeight: 700,
          }}>
            💬 Lade Chat...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    }}>
      {/* Floating Stars Animation */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {[...Array(30)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: 'rgba(242, 159, 5, 0.6)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`,
              '@keyframes twinkle': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' }
              }
            }}
          />
        ))}
      </Box>

      <PageLayout showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', py: { xs: 2, md: 3 } }}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Header */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            mb: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={2}
                sx={{
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <IconButton 
                  onClick={() => router.back()}
                  sx={{ 
                    color: '#FFD700',
                    '&:hover': {
                      background: 'rgba(255, 215, 0, 0.1)',
                    }
                  }}
                >
                  <ArrowLeft size={24} />
                </IconButton>
                
                <Avatar 
                  src={user?.image} 
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 10px rgba(242, 159, 5, 0.3)',
                    flexShrink: 0,
                  }}
                />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 700,
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {user?.name}, {user?.age}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    sx={{ 
                      mt: 0.5,
                      flexWrap: 'wrap',
                      gap: 0.5,
                    }}
                  >
                    <Chip 
                      label={user?.hd_type} 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)', 
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        whiteSpace: 'nowrap',
                      }} 
                    />
                    <Chip 
                      label={user?.profile} 
                      size="small" 
                      sx={{ 
                        background: 'rgba(255, 215, 0, 0.2)', 
                        color: '#FFD700',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 215, 0, 0.4)',
                        whiteSpace: 'nowrap',
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: user?.isOnline ? '#FFD700' : 'rgba(255,255,255,0.6)', 
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.isOnline ? '● Online' : user?.lastSeen}
                    </Typography>
                  </Stack>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <IconButton sx={{ 
                    color: '#FFD700',
                    '&:hover': {
                      background: 'rgba(255, 215, 0, 0.1)',
                    }
                  }}>
                    <Phone size={20} />
                  </IconButton>
                  <IconButton sx={{ 
                    color: '#FFD700',
                    '&:hover': {
                      background: 'rgba(255, 215, 0, 0.1)',
                    }
                  }}>
                    <Video size={20} />
                  </IconButton>
                  <IconButton sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}>
                    <MoreVertical size={20} />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Messages */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(242, 159, 5, 0.5)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(242, 159, 5, 0.7)',
            }
          }}>
          <Stack spacing={2}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                {message.sender === 'them' && (
                  <Avatar 
                    src={user?.image} 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      border: '1px solid rgba(255, 215, 0, 0.5)',
                      boxShadow: '0 0 8px rgba(242, 159, 5, 0.3)'
                    }}
                  />
                )}
                
                <Paper
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 3,
                    background: message.sender === 'me' 
                      ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                      : 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: message.sender === 'me' 
                      ? '1px solid rgba(255, 215, 0, 0.3)'
                      : '1px solid rgba(242, 159, 5, 0.2)',
                    boxShadow: message.sender === 'me'
                      ? '0 4px 12px rgba(242, 159, 5, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}>
                    {message.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </Paper>
                
                {message.sender === 'me' && (
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      border: '1px solid rgba(255, 215, 0, 0.5)',
                      boxShadow: '0 0 8px rgba(242, 159, 5, 0.3)'
                    }}
                  >
                    <Heart size={16} color="#FFD700" />
                  </Avatar>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

          {/* Message Input */}
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <IconButton sx={{ 
                  color: '#FFD700',
                  '&:hover': {
                    background: 'rgba(255, 215, 0, 0.1)',
                  }
                }}>
                  <Paperclip size={20} />
                </IconButton>
                <IconButton sx={{ 
                  color: '#FFD700',
                  '&:hover': {
                    background: 'rgba(255, 215, 0, 0.1)',
                  }
                }}>
                  <ImageIcon size={20} />
                </IconButton>
                <IconButton sx={{ 
                  color: '#FFD700',
                  '&:hover': {
                    background: 'rgba(255, 215, 0, 0.1)',
                  }
                }}>
                  <Smile size={20} />
                </IconButton>
                
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Nachricht schreiben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: 3,
                      '& fieldset': {
                        borderColor: 'rgba(242, 159, 5, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.6)',
                    },
                  }}
                />
                
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    background: 'linear-gradient(135deg, #FFD700, #F29F05)',
                    color: '#0b0a0f',
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.4)',
                      boxShadow: 'none'
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Send size={20} />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </PageLayout>
    </Box>
  );
}
