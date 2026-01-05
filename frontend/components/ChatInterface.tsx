"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send,
  MoreVert,
  AttachFile,
  EmojiEmotions,
  Phone,
  VideoCall,
  Info,
  Search,
  FilterList,
  Add,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import chatService, { ChatMessage, Chat, ChatUser } from '../lib/chat/chatService';

interface ChatInterfaceProps {
  currentUserId: string;
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export default function ChatInterface({ 
  currentUserId, 
  selectedChatId, 
  onChatSelect 
}: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [mockUsers] = useState<ChatUser[]>(chatService.getMockUsers());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket-Verbindung herstellen
  useEffect(() => {
    chatService.connect(currentUserId);
    setIsConnected(true);

    // Event-Handler registrieren
    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleNotification = (notification: any) => {
      console.log('Benachrichtigung erhalten:', notification);
      // Hier könnten Push-Benachrichtigungen implementiert werden
    };

    const handleTyping = (data: any) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    chatService.onNewMessage(handleNewMessage);
    chatService.onNotification(handleNotification);
    chatService.onTyping(handleTyping);

    // Chats laden
    loadChats();

    return () => {
      chatService.removeMessageHandler(handleNewMessage);
      chatService.removeNotificationHandler(handleNotification);
      chatService.removeTypingHandler(handleTyping);
    };
  }, [currentUserId]);

  // Nachrichten laden wenn Chat ausgewählt wird
  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
      chatService.joinChat(selectedChatId, currentUserId);
    }
  }, [selectedChatId, currentUserId]);

  // Auto-Scroll zu neuesten Nachrichten
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const userChats = await chatService.getChats(currentUserId);
      setChats(userChats);
    } catch (error) {
      console.error('Fehler beim Laden der Chats:', error);
      setError('Fehler beim Laden der Chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      setError('Fehler beim Laden der Nachrichten');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Finde den Empfänger
    const currentChat = chats.find(chat => chat.id === selectedChatId);
    if (!currentChat) return;

    const receiverId = currentChat.user1_id === currentUserId 
      ? currentChat.user2_id 
      : currentChat.user1_id;

    // Nachricht über WebSocket senden
    chatService.sendMessage(selectedChatId, currentUserId, receiverId, messageText);

    // Typing-Status stoppen
    chatService.setTyping(selectedChatId, currentUserId, false);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!selectedChatId) return;

    // Typing-Status senden
    chatService.setTyping(selectedChatId, currentUserId, true);

    // Typing-Timeout zurücksetzen
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.setTyping(selectedChatId!, currentUserId, false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = async (userId: string) => {
    try {
      const newChat = await chatService.createChat(currentUserId, userId);
      if (newChat) {
        setChats(prev => [newChat, ...prev]);
        setShowUserList(false);
        if (onChatSelect) {
          onChatSelect(newChat.id);
        }
      } else {
        setError('Fehler beim Erstellen des Chats');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Chats:', error);
      setError('Fehler beim Erstellen des Chats');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChatPartner = (chat: Chat) => {
    const partnerId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
    return mockUsers.find(user => user.id === partnerId);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat-Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderRadius: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            💬 Chat
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton 
              size="small" 
              sx={{ color: 'white' }}
              onClick={() => setShowUserList(true)}
            >
              <Add />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <Search />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        
        {!isConnected && (
          <Alert severity="warning" sx={{ mt: 1, fontSize: '0.8rem' }}>
            WebSocket-Verbindung getrennt
          </Alert>
        )}
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat-Liste */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <List>
            {chats.map((chat) => {
              const partner = getChatPartner(chat);
              return (
                <ListItem
                  key={chat.id}
                  button
                  selected={chat.id === selectedChatId}
                  onClick={() => onChatSelect?.(chat.id)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: partner?.isOnline ? '#4caf50' : '#9e9e9e',
                            border: '2px solid white'
                          }}
                        />
                      }
                    >
                      <Avatar src={partner?.avatar} alt={partner?.name}>
                        {partner?.name?.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight="bold">
                          {partner?.name || 'Unbekannt'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {chat.last_message_at ? formatTime(chat.last_message_at) : ''}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {chat.last_message || 'Keine Nachrichten'}
                        </Typography>
                        {partner && (
                          <Chip 
                            label={partner.hdType || partner.profile.type} 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Chat-Bereich */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChatId ? (
            <>
              {/* Chat-Header */}
              <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      {getChatPartner(chats.find(c => c.id === selectedChatId)!)?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {getChatPartner(chats.find(c => c.id === selectedChatId)!)?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getChatPartner(chats.find(c => c.id === selectedChatId)!)?.hdType || getChatPartner(chats.find(c => c.id === selectedChatId)!)?.profile.type} • 
                        {getChatPartner(chats.find(c => c.id === selectedChatId)!)?.isOnline ? ' Online' : ' Offline'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton size="small">
                      <Phone />
                    </IconButton>
                    <IconButton size="small">
                      <VideoCall />
                    </IconButton>
                    <IconButton size="small">
                      <Info />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>

              {/* Nachrichten-Bereich */}
              <Box 
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender_id === currentUserId ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: message.sender_id === currentUserId 
                              ? 'primary.main' 
                              : 'background.paper',
                            color: message.sender_id === currentUserId 
                              ? 'white' 
                              : 'text.primary',
                            borderRadius: message.sender_id === currentUserId 
                              ? '20px 20px 5px 20px' 
                              : '20px 20px 20px 5px'
                          }}
                        >
                          <Typography variant="body1">
                            {message.text}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 1,
                              opacity: 0.7,
                              fontSize: '0.7rem'
                            }}
                          >
                            {formatTime(message.created_at)}
                            {message.sender_id === currentUserId && (
                              <span style={{ marginLeft: 8 }}>
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </Typography>
                        </Paper>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing-Indikator */}
                {typingUsers.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {typingUsers.map(userId => {
                        const user = mockUsers.find(u => u.id === userId);
                        return user?.name;
                      }).join(', ')} tippt...
                    </Typography>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Nachrichten-Eingabe */}
              <Paper elevation={3} sx={{ p: 2, borderRadius: 0 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton size="small">
                    <AttachFile />
                  </IconButton>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Nachricht eingeben..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    multiline
                    maxRows={4}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                      },
                    }}
                  />
                  <IconButton size="small">
                    <EmojiEmotions />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '&:disabled': {
                        backgroundColor: 'grey.300',
                      },
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Paper>
            </>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              sx={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
              }}
            >
              <Box textAlign="center">
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  💬 Wähle einen Chat aus
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Oder starte einen neuen Chat mit einem Benutzer
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setShowUserList(true)}
                  sx={{ mt: 2 }}
                >
                  Neuen Chat starten
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Benutzer-Liste Dialog */}
      <Dialog 
        open={showUserList} 
        onClose={() => setShowUserList(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Benutzer auswählen</Typography>
            <IconButton onClick={() => setShowUserList(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {mockUsers.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => createNewChat(user.id)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: user.isOnline ? '#4caf50' : '#9e9e9e',
                          border: '2px solid white'
                        }}
                      />
                    }
                  >
                    <Avatar src={user.avatar} alt={user.name}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {user.hdType || user.profile.type} • {user.profile.type}
                      </Typography>
                      <Chip 
                        label={`${user.compatibility}% Kompatibilität`}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Fehler-Dialog */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}
