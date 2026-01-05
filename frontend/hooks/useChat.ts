"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import chatService, { ChatMessage, ChatUser } from '@/lib/chat/chatService';

// TypingIndicator Interface (wird lokal definiert, falls nicht vorhanden)
interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}

interface UseChatOptions {
  chatId?: string;
  autoConnect?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  typingUsers: string[];
  sendMessage: (content: string, receiverId: string) => boolean;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  joinChat: (chatId: string) => boolean;
  leaveChat: (chatId: string) => boolean;
  clearMessages: () => void;
  error: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { chatId, autoConnect = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserId = useRef<string | null>(null);

  // Initialize current user ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      currentUserId.current = localStorage.getItem('userId');
    }
  }, []);

  // Auto-connect to chat
  useEffect(() => {
    if (autoConnect && chatId) {
      // Verwende joinChatSync für boolean return
      if ((chatService as any).joinChatSync) {
        (chatService as any).joinChatSync(chatId);
      } else {
        chatService.joinChat(chatId);
      }
    }

    return () => {
      if (chatId) {
        chatService.leaveChat(chatId);
      }
    };
  }, [chatId, autoConnect]);

  // Connection status handler
  useEffect(() => {
    const unsubscribe = chatService.onConnection((connected) => {
      setIsConnected(connected);
      if (connected) {
        setError(null);
      } else {
        setError('Verbindung zum Chat-Server unterbrochen');
      }
    });

    return unsubscribe;
  }, []);

  // Message handler
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    return unsubscribe;
  }, []);

  // Typing indicator handler
  useEffect(() => {
    const unsubscribe = chatService.onTyping((indicator: TypingIndicator) => {
      if (indicator.userId !== currentUserId.current) {
        if (indicator.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(indicator.userId)) {
              return [...prev, indicator.userId];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(id => id !== indicator.userId));
        }
      }
    });

    return unsubscribe;
  }, []);

  // Auto-stop typing indicator
  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  const sendMessage = useCallback((content: string, receiverId: string): boolean => {
    if (!currentUserId.current || !chatId) {
      setError('Benutzer nicht authentifiziert oder Chat nicht ausgewählt');
      return false;
    }

    // Verwende die sendMessage-Methode mit korrekter Signatur
    const successPromise = chatService.sendMessage(
      chatId,
      currentUserId.current,
      receiverId,
      content
    );

    // sendMessage ist async, aber useChat erwartet boolean
    successPromise.then(success => {
      if (success) {
        setError(null);
      } else {
        setError('Nachricht konnte nicht gesendet werden');
      }
    });

    // Return true optimistisch, da sendMessage async ist
    return true;
  }, [chatId]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    chatService.sendTypingIndicator(receiverId, isTyping);
    setIsTyping(isTyping);
  }, []);

  const joinChat = useCallback((chatId: string): boolean => {
    // Verwende joinChatSync für boolean return
    return (chatService as any).joinChatSync?.(chatId) ?? true;
  }, []);

  const leaveChat = useCallback((chatId: string): boolean => {
    return chatService.leaveChat(chatId);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    isTyping,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    joinChat,
    leaveChat,
    clearMessages,
    error
  };
}
