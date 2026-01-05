"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, BarChart3, Heart, Users, Zap, Eye, Moon, Flame, RotateCcw, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  hasChart?: boolean;
  chartData?: {
    type: string;
    profile: string;
    authority: string;
    centers: string[];
    channels: string[];
    gates: string[];
  };
}

interface ChatWithChartProps {
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    hdType: string;
    profile: string;
    authority: string;
    centers: string[];
    channels: string[];
    gates: string[];
  };
  userChart: {
    type: string;
    profile: string;
    authority: string;
    centers: string[];
    channels: string[];
    gates: string[];
  };
}

const ChatWithChart: React.FC<ChatWithChartProps> = ({ otherUser, userChart }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hallo! Ich sehe, wir haben eine interessante Kompatibilität! 🌟',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      hasChart: true,
      chartData: {
        type: otherUser.hdType,
        profile: otherUser.profile,
        authority: otherUser.authority,
        centers: otherUser.centers,
        channels: otherUser.channels,
        gates: otherUser.gates,
      }
    },
    {
      id: '2',
      text: 'Ja, das stimmt! Dein Human Design Chart zeigt eine sehr harmonische Verbindung zu meinem.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: '3',
      text: 'Lass uns unsere Charts vergleichen! 📊',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showChartComparison, setShowChartComparison] = useState(false);
  const [showChartOverlay, setShowChartOverlay] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const responses = [
        'Das ist sehr interessant! 🤔',
        'Ich verstehe, was du meinst! 💭',
        'Unsere Human Design Charts zeigen wirklich eine besondere Verbindung! ✨',
        'Lass uns mehr über unsere Kompatibilität erfahren! 📈',
        'Deine Energie fühlt sich sehr harmonisch an! 🌟'
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'other',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getHdTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'generator':
        return <Zap size={16} />;
      case 'projector':
        return <Eye size={16} />;
      case 'manifestor':
        return <Flame size={16} />;
      case 'reflector':
        return <Moon size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getHdTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'generator':
        return '#10B981';
      case 'projector':
        return '#8B5CF6';
      case 'manifestor':
        return '#F59E0B';
      case 'reflector':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  const calculateCompatibility = () => {
    // Simple compatibility calculation
    const userCenters = userChart.centers;
    const otherCenters = otherUser.centers;
    const commonCenters = userCenters.filter(center => otherCenters.includes(center));
    
    const compatibility = Math.round((commonCenters.length / Math.max(userCenters.length, otherCenters.length)) * 100);
    
    return {
      score: compatibility,
      commonCenters,
      strengths: [
        'Harmonische Energie-Flüsse',
        'Komplementäre Autoritäten',
        'Gegenseitige Unterstützung',
        'Tiefe Verständigung'
      ],
      challenges: [
        'Unterschiedliche Kommunikationsstile',
        'Verschiedene Entscheidungsprozesse'
      ]
    };
  };

  const compatibility = calculateCompatibility();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={otherUser.avatar}
              sx={{ width: 40, height: 40, border: '2px solid white' }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {otherUser.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={getHdTypeIcon(otherUser.hdType)}
                  label={`${otherUser.hdType} ${otherUser.profile}`}
                  size="small"
                  sx={{
                    backgroundColor: `${getHdTypeColor(otherUser.hdType)}20`,
                    color: getHdTypeColor(otherUser.hdType),
                    border: `1px solid ${getHdTypeColor(otherUser.hdType)}40`,
                    height: 20,
                    fontSize: '0.7rem',
                  }}
                />
                <Chip
                  label={`${compatibility.score}% Match`}
                  size="small"
                  sx={{
                    backgroundColor: '#22c55e20',
                    color: '#22c55e',
                    border: '1px solid #22c55e40',
                    height: 20,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setShowChartComparison(true)}
              sx={{ color: 'white' }}
              title="Chart-Vergleich"
            >
              <BarChart3 size={20} />
            </IconButton>
            <IconButton
              onClick={() => setShowChartOverlay(true)}
              sx={{ color: 'white' }}
              title="Chart-Overlay"
            >
              <Heart size={20} />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          background: 'linear-gradient(180deg, #0F0F23 0%, #1A1A2E 100%)',
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
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  {message.sender === 'other' && (
                    <Avatar
                      src={otherUser.avatar}
                      sx={{ width: 32, height: 32 }}
                    />
                  )}
                  
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: message.sender === 'user' 
                        ? 'primary.main' 
                        : 'background.paper',
                      color: message.sender === 'user' 
                        ? 'white' 
                        : 'text.primary',
                      borderRadius: 2,
                      border: message.sender === 'user' 
                        ? 'none' 
                        : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: message.hasChart ? 1 : 0 }}>
                      {message.text}
                    </Typography>
                    
                    {message.hasChart && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowChartOverlay(true);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BarChart3 size={16} />
                          <Typography variant="body2">
                            Chart anzeigen
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        textAlign: message.sender === 'user' ? 'right' : 'left',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton sx={{ color: 'text.secondary' }}>
            <Paperclip size={20} />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht schreiben..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2,
              },
            }}
          />
          
          <IconButton sx={{ color: 'text.secondary' }}>
            <Smile size={20} />
          </IconButton>
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              color: 'primary.main',
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
          >
            <Send size={20} />
          </IconButton>
        </Box>
      </Paper>

      {/* Chart Comparison Dialog */}
      <Dialog
        open={showChartComparison}
        onClose={() => setShowChartComparison(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            📊 Human Design Chart-Vergleich
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Kompatibilitätsanalyse zwischen {otherUser.name} und dir
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Compatibility Score */}
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', p: 3, mb: 2 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {compatibility.score}%
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Kompatibilitäts-Score
                </Typography>
              </Card>
            </Grid>

            {/* User Charts */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Dein Chart
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    icon={getHdTypeIcon(userChart.type)}
                    label={`${userChart.type} ${userChart.profile}`}
                    sx={{
                      backgroundColor: `${getHdTypeColor(userChart.type)}20`,
                      color: getHdTypeColor(userChart.type),
                      border: `1px solid ${getHdTypeColor(userChart.type)}40`,
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Autorität:</strong> {userChart.authority}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Zentren:</strong> {userChart.centers.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Kanäle:</strong> {userChart.channels.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tore:</strong> {userChart.gates.length}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  {otherUser.name}'s Chart
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    icon={getHdTypeIcon(otherUser.hdType)}
                    label={`${otherUser.hdType} ${otherUser.profile}`}
                    sx={{
                      backgroundColor: `${getHdTypeColor(otherUser.hdType)}20`,
                      color: getHdTypeColor(otherUser.hdType),
                      border: `1px solid ${getHdTypeColor(otherUser.hdType)}40`,
                    }}
                  />
                  <Typography variant="body2">
                    <strong>Autorität:</strong> {otherUser.authority}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Zentren:</strong> {otherUser.centers.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Kanäle:</strong> {otherUser.channels.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tore:</strong> {otherUser.gates.length}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Strengths */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                  💪 Stärken
                </Typography>
                {compatibility.strengths.map((strength, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {strength}
                  </Typography>
                ))}
              </Card>
            </Grid>

            {/* Challenges */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                  ⚠️ Herausforderungen
                </Typography>
                {compatibility.challenges.map((challenge, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {challenge}
                  </Typography>
                ))}
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowChartComparison(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chart Overlay Dialog */}
      <Dialog
        open={showChartOverlay}
        onClose={() => setShowChartOverlay(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            🔍 Chart-Details
          </Typography>
          {selectedMessage && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Chart-Informationen aus der Nachricht
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {selectedMessage?.chartData && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {otherUser.name}'s Human Design
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Typ:
                  </Typography>
                  <Chip
                    icon={getHdTypeIcon(selectedMessage.chartData.type)}
                    label={selectedMessage.chartData.type}
                    size="small"
                    sx={{
                      backgroundColor: `${getHdTypeColor(selectedMessage.chartData.type)}20`,
                      color: getHdTypeColor(selectedMessage.chartData.type),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Profil:
                  </Typography>
                  <Typography variant="body2">
                    {selectedMessage.chartData.profile}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Autorität:
                  </Typography>
                  <Typography variant="body2">
                    {selectedMessage.chartData.authority}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Zentren:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {selectedMessage.chartData.centers.map((center, index) => (
                      <Chip
                        key={index}
                        label={center}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowChartOverlay(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWithChart;
