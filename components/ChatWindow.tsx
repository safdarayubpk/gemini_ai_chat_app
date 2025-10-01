"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ErrorBanner from '@/components/ErrorBanner';
import OfflineBanner from '@/components/OfflineBanner';
import QuickActions from '@/components/QuickActions';

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

  // Scroll to bottom when messages change (but not on initial load)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
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

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
    setInputValue('');
    // Clear localStorage
    localStorage.removeItem('chat-messages');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Welcome State - Show Quick Actions when no messages */}
          {messages.length === 0 && (
            <div className="flex-shrink-0 pt-8">
              <QuickActions />
            </div>
          )}
          
          {/* Messages Container */}
          <div className="p-4 pb-4">
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
              
              {/* Messages */}
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  time={message.time}
                />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-slate-800/60 text-slate-100 p-3 rounded-lg rounded-bl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Input Container - Fixed at bottom */}
      <div className="fixed bottom-0 left-80 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 z-30 lg:block hidden">
        <div className="max-w-4xl mx-auto">
          {/* Input Area */}
          <div className="p-4">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0 ? "Message Gemini..." : "Continue the conversation..."}
                  disabled={isTyping || !isOnline}
                  className="w-full min-h-[52px] max-h-32 px-4 py-3 bg-slate-700/50 border border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl resize-none overflow-hidden"
                  style={{ 
                    height: 'auto',
                    minHeight: '52px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                  aria-label="Message input"
                  rows={1}
                />
              </div>
              <Button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping || !isOnline}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>Gemini can make mistakes. Consider checking important information.</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="hover:text-slate-300 transition-colors"
                  aria-label="Keyboard shortcuts"
                >
                  ⌘K
                </button>
                <span>•</span>
                <button 
                  className="hover:text-slate-300 transition-colors"
                  aria-label="Settings"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Input Container - Full width on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 z-30 lg:hidden">
        <div className="max-w-4xl mx-auto">
          {/* Input Area */}
          <div className="p-4">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0 ? "Message Gemini..." : "Continue the conversation..."}
                  disabled={isTyping || !isOnline}
                  className="w-full min-h-[52px] max-h-32 px-4 py-3 bg-slate-700/50 border border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl resize-none overflow-hidden"
                  style={{ 
                    height: 'auto',
                    minHeight: '52px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                  aria-label="Message input"
                  rows={1}
                />
              </div>
              <Button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping || !isOnline}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>Gemini can make mistakes. Consider checking important information.</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="hover:text-slate-300 transition-colors"
                  aria-label="Keyboard shortcuts"
                >
                  ⌘K
                </button>
                <span>•</span>
                <button 
                  className="hover:text-slate-300 transition-colors"
                  aria-label="Settings"
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

