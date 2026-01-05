'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, AlertCircle, TrendingUp, Presentation, MessageSquare, Target, FileText, Users, DollarSign, Lightbulb } from 'lucide-react';
import { Box, Button, Chip, Typography, TextField } from '@mui/material';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SalesAgentInterfaceProps {
  agentName: string;
  agentDescription: string;
  agentColor?: string;
  apiEndpoint: string;
  userId?: string;
  className?: string;
}

const salesTemplates = [
  {
    id: 'sales-strategy',
    name: 'Verkaufsstrategie',
    description: 'Entwickle eine umfassende Verkaufsstrategie',
    icon: Target,
    prompt: 'Entwickle eine Verkaufsstrategie für folgendes Produkt/Service:'
  },
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    description: 'Erstelle ein überzeugendes Pitch Deck',
    icon: Presentation,
    prompt: 'Erstelle ein Pitch Deck für folgendes Produkt/Unternehmen:'
  },
  {
    id: 'sales-script',
    name: 'Verkaufsgespräch',
    description: 'Erstelle ein Skript für Verkaufsgespräche',
    icon: MessageSquare,
    prompt: 'Erstelle ein Verkaufsgespräch-Skript für:'
  },
  {
    id: 'objection-handling',
    name: 'Einwände behandeln',
    description: 'Lerne, wie du Einwände professionell behandelst',
    icon: Users,
    prompt: 'Erstelle eine Strategie zur Behandlung folgender Einwände:'
  },
  {
    id: 'closing-techniques',
    name: 'Abschluss-Techniken',
    description: 'Lerne effektive Abschluss-Techniken',
    icon: DollarSign,
    prompt: 'Erkläre und entwickle Abschluss-Techniken für:'
  },
  {
    id: 'proposal',
    name: 'Angebot erstellen',
    description: 'Erstelle ein professionelles Verkaufsangebot',
    icon: FileText,
    prompt: 'Erstelle ein professionelles Verkaufsangebot für:'
  }
];

export default function SalesAgentInterface({
  agentName,
  agentDescription,
  agentColor = 'from-green-500 to-emerald-500',
  apiEndpoint,
  userId,
  className = ''
}: SalesAgentInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hallo! Ich bin dein ${agentName}. ${agentDescription}\n\nIch kann dir helfen bei:\n• Verkaufsstrategien entwickeln\n• Pitch Decks erstellen\n• Verkaufsgespräche führen\n• Einwände behandeln\n• Abschluss-Techniken anwenden\n• Professionelle Angebote erstellen\n• Verkaufsprozesse optimieren\n\nWähle eine Vorlage oder stelle mir eine Frage!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage('');
    setShowTemplates(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          userId: userId || `user_${Date.now()}`,
          context: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Senden der Nachricht');
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typeof data.response === 'string' ? data.response : data.response.message || JSON.stringify(data.response),
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Fehler beim Verarbeiten der Antwort');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      const errorMessageText = error instanceof Error ? error.message : 'Entschuldigung, es gab einen Fehler beim Verarbeiten Ihrer Nachricht. Bitte versuchen Sie es erneut.';
      setError(errorMessageText);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errorMessageText}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = (template: { prompt: string; name: string }) => {
    const prompt = `${template.prompt} [Bitte beschreibe dein Produkt/Service/Anforderung]`;
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(242, 159, 5, 0.15)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}
      className={className}
    >
      {/* Header - Fester Bereich */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(242, 159, 5, 0.2)',
        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.1))',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40,
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingUp size={20} style={{ color: '#ffffff' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
              {agentName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
              {agentDescription}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ 
          mx: 3, 
          mt: 2, 
          p: 2, 
          background: 'rgba(140, 29, 4, 0.2)', 
          border: '1px solid rgba(140, 29, 4, 0.4)', 
          borderRadius: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexShrink: 0
        }}>
          <AlertCircle size={20} style={{ color: '#F29F05' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Templates Section - Kompakt, nur erste Kategorie sichtbar */}
      {showTemplates && messages.length <= 1 && (
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(242, 159, 5, 0.2)', 
          flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Lightbulb size={20} style={{ color: '#F29F05' }} />
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                Schnellzugriff
              </Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowTemplates(false)}
              sx={{ 
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
                minWidth: 'auto',
                px: 1,
                '&:hover': {
                  background: 'rgba(242, 159, 5, 0.1)',
                  color: '#F29F05',
                }
              }}
            >
              Ausblenden
            </Button>
          </Box>

          {/* Nur erste Templates anzeigen, kompakt */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {salesTemplates.slice(0, 4).map((template) => (
              <Chip
                key={template.id}
                label={template.name}
                onClick={() => handleTemplateClick(template)}
                icon={<template.icon size={14} style={{ color: '#F29F05' }} />}
                sx={{
                  bgcolor: 'rgba(242, 159, 5, 0.15)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: '32px',
                  '&:hover': {
                    bgcolor: 'rgba(242, 159, 5, 0.25)',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                  },
                  transition: 'all 0.2s',
                }}
              />
            ))}
            {/* Weitere Templates als "Mehr..." Button */}
            {salesTemplates.length > 4 && (
              <Chip
                label="Mehr..."
                onClick={() => {
                  const remainingTemplates = salesTemplates.slice(4);
                  if (remainingTemplates.length > 0) {
                    handleTemplateClick(remainingTemplates[0]);
                  }
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: '32px',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                  },
                  transition: 'all 0.2s',
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Messages Container - Scrollbar */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 3,
          minHeight: 0,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(242, 159, 5, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(242, 159, 5, 0.5)',
            },
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {message.role === 'assistant' && (
              <Box sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={16} style={{ color: '#ffffff' }} />
              </Box>
            )}
            
            <Box
              sx={{
                maxWidth: '80%',
                borderRadius: 2,
                p: 2,
                background: message.role === 'user'
                  ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: message.role === 'assistant' ? '1px solid rgba(242, 159, 5, 0.2)' : 'none',
              }}
            >
              <Typography 
                variant="body2"
                sx={{ 
                  color: message.role === 'user' ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9375rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  mb: 0.5
                }}
              >
                {message.content}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: message.role === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.7rem'
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>

            {message.role === 'user' && (
              <Box sx={{
                width: 32,
                height: 32,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(242, 159, 5, 0.2)'
              }}>
                <User size={16} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
              </Box>
            )}
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Box sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <TrendingUp size={16} style={{ color: '#ffffff' }} />
            </Box>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(242, 159, 5, 0.2)'
            }}>
              <Loader2 size={16} className="animate-spin" style={{ color: '#F29F05' }} />
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input - Fester Bereich */}
      <Box sx={{ 
        borderTop: '1px solid rgba(242, 159, 5, 0.2)', 
        p: 3, 
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Schreibe eine Nachricht..."
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                color: '#ffffff',
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                },
                '&.Mui-focused': {
                  borderColor: '#F29F05',
                  boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)',
                },
                '& fieldset': {
                  border: 'none',
                },
                '& textarea': {
                  color: '#ffffff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: '#ffffff',
              minWidth: 56,
              height: 56,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                boxShadow: '0 4px 12px rgba(242, 159, 5, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(242, 159, 5, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

