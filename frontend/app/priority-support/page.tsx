'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  MessageCircle, 
  Clock, 
  Star,
  Sparkles,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
  Video,
  Mail,
  FileText,
  Users,
  Award,
  Gift
} from 'lucide-react';

export default function PrioritySupportPage() {
  const [supportDialog, setSupportDialog] = useState(false);
  const [ticketType, setTicketType] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [supportStats, setSupportStats] = useState({
    averageResponseTime: '15 Minuten',
    satisfactionRating: 4.9,
    ticketsResolved: 1247,
    activeTickets: 3
  });

  const [supportChannels, setSupportChannels] = useState([
    {
      id: 1,
      name: 'Live Chat',
      description: 'Sofortige Hilfe über unseren Live-Chat',
      icon: <MessageCircle size={24} />,
      responseTime: 'Sofort',
      availability: '24/7',
      status: 'online',
      color: '#10b981'
    },
    {
      id: 2,
      name: 'Video Call',
      description: 'Persönliche Beratung per Video-Call',
      icon: <Video size={24} />,
      responseTime: '15 Min',
      availability: '9-18 Uhr',
      status: 'available',
      color: '#06b6d4'
    },
    {
      id: 3,
      name: 'Telefon Support',
      description: 'Direkter Anruf bei unseren Experten',
      icon: <Phone size={24} />,
      responseTime: '5 Min',
      availability: '9-18 Uhr',
      status: 'available',
      color: '#8b5cf6'
    },
    {
      id: 4,
      name: 'E-Mail Support',
      description: 'Detaillierte Anfragen per E-Mail',
      icon: <Mail size={24} />,
      responseTime: '2 Stunden',
      availability: '24/7',
      status: 'online',
      color: '#f59e0b'
    }
  ]);

  const [supportTeam, setSupportTeam] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior Support Specialist',
      avatar: '👩‍💼',
      expertise: ['Human Design', 'Dating', 'Technische Probleme'],
      rating: 4.9,
      status: 'online',
      responseTime: '5 Min'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Premium Support Manager',
      avatar: '👨‍💼',
      expertise: ['Account Management', 'Billing', 'VIP Features'],
      rating: 4.8,
      status: 'online',
      responseTime: '3 Min'
    },
    {
      id: 3,
      name: 'Lisa Thompson',
      role: 'Technical Support Expert',
      avatar: '👩‍💻',
      expertise: ['App Probleme', 'API', 'Integration'],
      rating: 4.9,
      status: 'away',
      responseTime: '15 Min'
    }
  ]);

  const [recentTickets, setRecentTickets] = useState([
    {
      id: 1,
      subject: 'Probleme mit der App',
      status: 'Gelöst',
      priority: 'Hoch',
      createdAt: '2024-01-10',
      resolvedAt: '2024-01-10',
      rating: 5
    },
    {
      id: 2,
      subject: 'Frage zu Premium Features',
      status: 'In Bearbeitung',
      priority: 'Mittel',
      createdAt: '2024-01-12',
      resolvedAt: null,
      rating: null
    },
    {
      id: 3,
      subject: 'Account-Einstellungen',
      status: 'Gelöst',
      priority: 'Niedrig',
      createdAt: '2024-01-08',
      resolvedAt: '2024-01-08',
      rating: 4
    }
  ]);

  const handleSubmitTicket = () => {
    // Submit ticket logic here
    setSupportDialog(false);
    setShowSuccess(true);
    setTicketType('');
    setPriority('');
    setSubject('');
    setMessage('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return '#ef4444';
      case 'Mittel': return '#f59e0b';
      case 'Niedrig': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Gelöst': return '#10b981';
      case 'In Bearbeitung': return '#f59e0b';
      case 'Offen': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Stars Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '12px'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            ✨
          </motion.div>
        ))}
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header */}
        <motion.div
          
          
          
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Headphones size={48} color="#10b981" />
              <Typography variant="h2" sx={{ ml: 2, fontWeight: 700, background: 'linear-gradient(45deg, #10b981, #34d399)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Prioritäts-Support
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              24/7 Premium-Kundensupport für VIP-Mitglieder
            </Typography>
            <Chip 
              icon={<Crown size={16} />} 
              label="VIP Exklusiv" 
              sx={{ 
                background: 'linear-gradient(45deg, #f59e0b, #ffd700)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1
              }} 
            />
          </Box>
        </motion.div>

        {/* Stats */}
        <motion.div
          
          
          
        >
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
              }}>
                <Clock size={32} color="#10b981" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{supportStats.averageResponseTime}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Durchschnittliche Antwortzeit</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
              }}>
                <Star size={32} color="#f59e0b" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{supportStats.satisfactionRating}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Zufriedenheitsbewertung</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
              }}>
                <CheckCircle size={32} color="#06b6d4" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{supportStats.ticketsResolved}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Gelöste Tickets</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center'
              }}>
                <FileText size={32} color="#8b5cf6" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{supportStats.activeTickets}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Aktive Tickets</Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        <Grid container spacing={4}>
          {/* Support Channels */}
          <Grid item xs={12} md={6}>
            <motion.div
              
              
              
            >
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Support-Kanäle
              </Typography>
              <Grid container spacing={3}>
                {supportChannels.map((channel, index) => (
                  <Grid item xs={12} sm={6} key={channel.id}>
                    <Paper elevation={0} sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      p: 3,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: 'rgba(139, 92, 246, 0.3)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${channel.color}, ${channel.color}80)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          color: 'white'
                        }}>
                          {channel.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {channel.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {channel.description}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Antwortzeit: {channel.responseTime}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Shield size={16} color="rgba(255, 255, 255, 0.6)" />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Verfügbar: {channel.availability}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip 
                          label={channel.status === 'online' ? 'Online' : 'Verfügbar'} 
                          size="small" 
                          sx={{ 
                            background: channel.status === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                            color: channel.status === 'online' ? '#10b981' : '#6b7280',
                            fontSize: '10px'
                          }} 
                        />
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            background: `linear-gradient(45deg, ${channel.color}, ${channel.color}80)`,
                            color: 'white',
                            fontSize: '12px',
                            minWidth: 'auto'
                          }}
                        >
                          Starten
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>

          {/* Support Team */}
          <Grid item xs={12} md={6}>
            <motion.div
              
              
              
            >
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Support-Team
              </Typography>
              <List>
                {supportTeam.map((member, index) => (
                  <ListItem key={member.id} sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: member.status === 'online' ? '#10b981' : '#f59e0b',
                            border: '2px solid white'
                          }} />
                        }
                      >
                        <Avatar sx={{ 
                          width: 60,
                          height: 60,
                          fontSize: '24px',
                          background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)'
                        }}>
                          {member.avatar}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {member.name}
                          </Typography>
                          <Chip 
                            label={member.status === 'online' ? 'Online' : 'Abwesend'} 
                            size="small" 
                            sx={{ 
                              background: member.status === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: member.status === 'online' ? '#10b981' : '#f59e0b',
                              fontSize: '10px'
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {member.role}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Star size={14} color="#f59e0b" />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {member.rating}/5 • Antwortzeit: {member.responseTime}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {member.expertise.map((skill, idx) => (
                              <Chip 
                                key={idx}
                                label={skill} 
                                size="small" 
                                sx={{ 
                                  background: 'rgba(139, 92, 246, 0.2)',
                                  color: '#8b5cf6',
                                  fontSize: '10px',
                                  height: '20px'
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Tickets */}
        <motion.div
          
          
          
        >
          <Paper elevation={0} sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            p: 4,
            mt: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FileText size={24} color="#8b5cf6" />
                <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>Deine Tickets</Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Send size={16} />}
                onClick={() => setSupportDialog(true)}
                sx={{
                  background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Neues Ticket
              </Button>
            </Box>
            
            <List>
              {recentTickets.map((ticket, index) => (
                <ListItem key={ticket.id} sx={{ px: 0, py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      width: 50,
                      height: 50,
                      background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)'
                    }}>
                      <FileText size={24} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {ticket.subject}
                        </Typography>
                        <Chip 
                          label={ticket.status} 
                          size="small" 
                          sx={{ 
                            background: getStatusColor(ticket.status) + '20',
                            color: getStatusColor(ticket.status),
                            fontSize: '10px'
                          }} 
                        />
                        <Chip 
                          label={ticket.priority} 
                          size="small" 
                          sx={{ 
                            background: getPriorityColor(ticket.priority) + '20',
                            color: getPriorityColor(ticket.priority),
                            fontSize: '10px'
                          }} 
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Erstellt: {ticket.createdAt}
                          {ticket.resolvedAt && ` • Gelöst: ${ticket.resolvedAt}`}
                        </Typography>
                        {ticket.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Star size={14} color="#f59e0b" />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              Bewertung: {ticket.rating}/5
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </motion.div>
      </Container>

      {/* Support Dialog */}
      <Dialog 
        open={supportDialog} 
        onClose={() => setSupportDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
          color: 'white',
          fontWeight: 600
        }}>
          Neues Support-Ticket
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Ticket-Typ</InputLabel>
            <Select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              sx={{ 
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
              }}
            >
              <MenuItem value="technical" sx={{ color: 'white' }}>Technisches Problem</MenuItem>
              <MenuItem value="account" sx={{ color: 'white' }}>Account-Frage</MenuItem>
              <MenuItem value="billing" sx={{ color: 'white' }}>Abrechnung</MenuItem>
              <MenuItem value="feature" sx={{ color: 'white' }}>Feature-Anfrage</MenuItem>
              <MenuItem value="other" sx={{ color: 'white' }}>Sonstiges</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Priorität</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              sx={{ 
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
              }}
            >
              <MenuItem value="low" sx={{ color: 'white' }}>Niedrig</MenuItem>
              <MenuItem value="medium" sx={{ color: 'white' }}>Mittel</MenuItem>
              <MenuItem value="high" sx={{ color: 'white' }}>Hoch</MenuItem>
              <MenuItem value="urgent" sx={{ color: 'white' }}>Dringend</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Betreff"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ mb: 3 }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            inputProps={{ sx: { color: 'white' } }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nachricht"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 3 }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            inputProps={{ sx: { color: 'white' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setSupportDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmitTicket}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
              color: 'white',
              fontWeight: 600
            }}
          >
            Ticket senden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Support-Ticket erfolgreich erstellt!"
      />
    </Box>
  );
}
