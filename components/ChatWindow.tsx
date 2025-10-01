"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ErrorBanner from '@/components/ErrorBanner';
import OfflineBanner from '@/components/OfflineBanner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function ChatWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState<Message | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSend = async (retryMessage?: Message) => {
    const messageToSend = retryMessage || {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!messageToSend.content.trim() || isTyping || !isOnline) return;

    // Clear any existing errors
    setError(null);

    // Add user message immediately (only if not retrying)
    if (!retryMessage) {
      setMessages(prev => [...prev, messageToSend]);
      setInputValue('');
      setLastUserMessage(messageToSend);
    }

    setIsTyping(true);

    try {
      // Call the API with all messages for context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, messageToSend].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (data.success && data.assistant) {
        // Add assistant response from Gemini
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.assistant,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
        setLastUserMessage(null); // Clear retry message on success
      } else {
        // Handle API error
        setError(data.error || 'Failed to get response from AI service');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto relative">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-2">
          {/* Offline Banner */}
          {!isOnline && <OfflineBanner />}
          
          {/* Error Banner */}
          {error && (
            <ErrorBanner 
              error={error} 
              onRetry={lastUserMessage ? handleRetry : undefined}
              onDismiss={handleDismissError}
            />
          )}
          
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>Start a conversation by typing a message below!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                time={message.time}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-slate-800/60 text-slate-100 p-3 rounded-lg rounded-bl-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          
          {/* Scroll anchor with extra padding to ensure input doesn't hide content */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
      
      {/* Fixed Input Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex w-full gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
              disabled={isTyping || !isOnline}
              className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Message input"
            />
            <Button 
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping || !isOnline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

