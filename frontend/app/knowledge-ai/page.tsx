"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { 
  Search, 
  BookOpen, 
  Brain, 
  Sparkles,
  MessageSquare,
  Lightbulb,
  Target,
  Users
} from 'lucide-react';
import axios from 'axios';

// Animierte Sterne Komponente
const AnimatedStars = () => (
  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          width: '3px',
          height: '3px',
          background: '#FFD700',
          borderRadius: '50%',
          boxShadow: '0 0 8px #FFD700, 0 0 16px #FFD700, 0 0 24px #FFD700',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [0.6, 1.4, 0.6],
        }}
        transition={{
          duration: 2.5 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      />
    ))}
  </Box>
);

// Vordefinierte Fragen
const predefinedQuestions = [
  {
    category: "Grundlagen",
    questions: [
      "Was ist Human Design?",
      "Wie funktioniert die Chart-Berechnung?",
      "Was sind die verschiedenen Typen?",
      "Was bedeutet Strategie und Autorität?"
    ]
  },
  {
    category: "Typen",
    questions: [
      "Was macht einen Generator aus?",
      "Wie lebt ein Manifestor richtig?",
      "Was ist die Strategie eines Projectors?",
      "Wie funktioniert ein Reflector?"
    ]
  },
  {
    category: "Zentren",
    questions: [
      "Was bedeutet ein offenes Sakral-Zentrum?",
      "Wie wirkt sich ein definiertes Herz-Zentrum aus?",
      "Was ist die Bedeutung des Solar Plexus?",
      "Wie beeinflusst das G-Zentrum Beziehungen?"
    ]
  },
  {
    category: "Praktische Anwendung",
    questions: [
      "Wie kann ich Human Design im Alltag nutzen?",
      "Was hilft bei Entscheidungsfindung?",
      "Wie verbessere ich meine Beziehungen?",
      "Welche Rolle spielt der Mondkalender?"
    ]
  }
];

export default function KnowledgeAIPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{question: string, answer: string}>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/knowledge/query', {
        question: question.trim(),
        context: 'Human Design Wissensdatenbank'
      });

      const newAnswer = response.data.answer;
      setAnswer(newAnswer);
      setChatHistory(prev => [...prev, { question: question, answer: newAnswer }]);
      setQuestion('');

    } catch (err) {
      console.error('Fehler bei der Wissensabfrage:', err);
      setError('Fehler bei der Wissensabfrage. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedQuestion = (predefinedQuestion: string) => {
    setQuestion(predefinedQuestion);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
        <AnimatedStars />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 4, pb: 4 }}>

          {/* Error Alert */}
          {error && (
            <motion.div
              
              
              
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            {/* Left Column - Question Input & Predefined Questions */}
            <motion.div
              
              
              
            >
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: 4, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                mb: 4
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Search size={24} style={{ color: '#667eea' }} />
                    <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 600 }}>
                      Frage stellen
                    </Typography>
                  </Box>

                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Stelle eine Frage zur Human Design Wissensdatenbank..."
                      variant="outlined"
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                        }
                      }}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !question.trim()}
                      startIcon={loading ? <CircularProgress size={20} /> : <Brain size={20} />}
                      sx={{
                        bgcolor: '#667eea',
                        color: '#fff',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#5a67d8'
                        }
                      }}
                    >
                      {loading ? 'Suche...' : 'Frage stellen'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Predefined Questions */}
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: 4, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Lightbulb size={24} style={{ color: '#fbbf24' }} />
                    <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 600 }}>
                      Häufige Fragen
                    </Typography>
                  </Box>

                  {predefinedQuestions.map((category, categoryIndex) => (
                    <Box key={categoryIndex} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ color: '#667eea', mb: 2, fontWeight: 600 }}>
                        {category.category}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {category.questions.map((q, qIndex) => (
                          <Chip
                            key={qIndex}
                            label={q}
                            onClick={() => handlePredefinedQuestion(q)}
                            sx={{
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'rgba(102, 126, 234, 0.2)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Answer Display */}
            <motion.div
              
              
              
            >
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: 4, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                height: 'fit-content'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <BookOpen size={24} style={{ color: '#38b2ac' }} />
                    <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 600 }}>
                      Antwort
                    </Typography>
                  </Box>

                  {answer ? (
                    <Paper sx={{ p: 3, bgcolor: 'rgba(56, 178, 172, 0.05)', border: '1px solid rgba(56, 178, 172, 0.2)' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#4a5568', 
                          lineHeight: 1.8,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {answer}
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      color: '#718096'
                    }}>
                      <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                      <Typography variant="body1">
                        Stelle eine Frage, um eine Antwort aus der Wissensdatenbank zu erhalten.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4, 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  mt: 4
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Users size={24} style={{ color: '#e53e3e' }} />
                      <Typography variant="h5" sx={{ color: '#4a5568', fontWeight: 600 }}>
                        Verlauf
                      </Typography>
                    </Box>

                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {chatHistory.map((chat, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ color: '#667eea', fontWeight: 600, mb: 1 }}>
                            Frage:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4a5568', mb: 2, fontStyle: 'italic' }}>
                            {chat.question}
                          </Typography>
                          
                          <Typography variant="subtitle2" sx={{ color: '#38b2ac', fontWeight: 600, mb: 1 }}>
                            Antwort:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.6 }}>
                            {chat.answer.length > 200 ? `${chat.answer.substring(0, 200)}...` : chat.answer}
                          </Typography>
                          
                          {index < chatHistory.length - 1 && (
                            <Divider sx={{ mt: 2, mb: 2 }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </Box>
        </Container>
    </Box>
  );
}
