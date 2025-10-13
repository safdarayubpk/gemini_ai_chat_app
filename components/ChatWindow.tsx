"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ErrorBanner from '@/components/ErrorBanner';
import OfflineBanner from '@/components/OfflineBanner';
import QuickActions from '@/components/QuickActions';
import { getLocalStorageItem, setLocalStorageItem, isValidMessage } from '@/lib/localStorage';
import { useStreamingChat } from '@/hooks/useStreamingChat';
// import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  timestamp?: number; // Full timestamp for proper date handling
}

interface ChatWindowProps {
  isSidebarHidden?: boolean;
  currentChatId?: string;
}

export default function ChatWindow({ isSidebarHidden = false, currentChatId = 'current-chat' }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState<Message | null>(null);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);

  // Initialize streaming hook with callbacks
  const { sendMessage, cancelStream, isStreaming, streamedContent, resetStream } = useStreamingChat({
    onChunk: (text) => {
      // Update the streaming message in real-time
      if (streamingMessageIdRef.current) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    },
    onComplete: (fullText) => {
      // Finalize the streaming message
      console.log("Streaming completed:", fullText.substring(0, 50) + "...");
      streamingMessageIdRef.current = null;
      setLastUserMessage(null);
      resetStream();
    },
    onError: (errorMessage) => {
      // Handle streaming errors
      setError(errorMessage);
      if (streamingMessageIdRef.current) {
        // Remove incomplete message
        setMessages(prev => prev.filter(msg => msg.id !== streamingMessageIdRef.current));
        streamingMessageIdRef.current = null;
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      cancelStream();
    };
  }, [cancelStream]);

  // Load messages from localStorage based on currentChatId
  useEffect(() => {
    try {
      const chatKey = `chat-messages-${currentChatId}`;
      const savedMessages = getLocalStorageItem<Message[]>(chatKey, []);
      if (savedMessages.length > 0) {
        // Validate each message has required properties
        const validMessages = savedMessages.filter(isValidMessage);
        
        if (validMessages.length === savedMessages.length) {
          setMessages(validMessages);
        } else {
          console.warn('Some messages have invalid format, using valid ones only');
          setMessages(validMessages);
          // Update localStorage with only valid messages
          setLocalStorageItem(chatKey, validMessages);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      // Clear potentially corrupted data
      const chatKey = `chat-messages-${currentChatId}`;
      setLocalStorageItem(chatKey, []);
      setMessages([]);
    }
  }, [currentChatId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatKey = `chat-messages-${currentChatId}`;
      setLocalStorageItem(chatKey, messages);
      // Also save to the legacy key for backward compatibility
      setLocalStorageItem('chat-messages', messages);
      // Dispatch event to update sidebar
      const event = new CustomEvent('messageUpdate');
      window.dispatchEvent(event);
    }
  }, [messages, currentChatId]);

  // Scroll to bottom when messages change (but not on initial load)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

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

  const handleNewChatInternal = useCallback(() => {
    // Cancel any ongoing stream
    cancelStream();
    
    setMessages([]);
    setError(null);
    setLastUserMessage(null);
    setInputValue('');
    setIsAutoRetrying(false);
    streamingMessageIdRef.current = null;
    resetStream();
    // Don't clear localStorage here - let the new chat ID handle it
  }, [cancelStream, resetStream]);

  // Listen for new chat events from sidebar
  useEffect(() => {
    const handleNewChat = () => {
      handleNewChatInternal();
    };

    window.addEventListener('newChat', handleNewChat);
    return () => window.removeEventListener('newChat', handleNewChat);
  }, [handleNewChatInternal]);

  const handleSend = async (retryMessage?: Message) => {
    const now = new Date();
    const messageToSend = retryMessage || {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue.trim(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime()
    };

    if (!messageToSend.content.trim() || isStreaming || !isOnline) return;

    // Clear any existing errors
    setError(null);

    // Add user message immediately (only if not retrying)
    if (!retryMessage) {
      setMessages(prev => [...prev, messageToSend]);
      setInputValue('');
      setLastUserMessage(messageToSend);
    }

    // Create empty assistant message for streaming
    const assistantNow = new Date();
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // Start with empty content
      time: assistantNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: assistantNow.getTime()
    };

    // Add empty assistant message to display streaming content
    setMessages(prev => [...prev, assistantMessage]);
    streamingMessageIdRef.current = assistantMessageId;

    try {
      // Send message with streaming
      await sendMessage([
        ...messages.filter(msg => msg.id !== assistantMessageId),
        messageToSend
      ].map(msg => ({
        role: msg.role,
        content: msg.content
      })));

    } catch (error) {
      console.error('Streaming error:', error);
      
      // Handle network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (!(error instanceof Error && error.name === 'AbortError')) {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleStop = () => {
    cancelStream();
    
    setIsAutoRetrying(false);
    streamingMessageIdRef.current = null;
    
    // Show cancellation message
    setError('Streaming cancelled by user');
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleResend = (editedContent: string) => {
        // Create a new message with the edited content
        const editNow = new Date();
        const editedMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: editedContent,
          time: editNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: editNow.getTime()
        };

    // Add the edited message to the messages array
    setMessages(prev => [...prev, editedMessage]);
    setLastUserMessage(editedMessage);
    
    // Send the message using the retry mechanism
    // Since we're passing a retryMessage, handleSend won't add it to messages again
    handleSend(editedMessage);
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
          {/* Welcome State - Show Greeting and Quick Actions when no messages */}
          {messages.length === 0 && (
            <div className="flex-shrink-0 pt-8">
              {/* Greeting Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 transition-colors duration-300">
                  Hello! 👋
                </h1>
                    <p className="text-lg text-gray-600 dark:text-slate-300 mb-1 transition-colors duration-300">
                      I&apos;m Gemini AI, your intelligent assistant.
                    </p>
                <p className="text-gray-500 dark:text-slate-400 transition-colors duration-300">
                  How can I help you today?
                </p>
              </div>
              
              {/* Quick Actions */}
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
                  error={isAutoRetrying ? `${error} (Auto-retrying in 3 seconds...)` : error} 
                  onRetry={lastUserMessage && !isAutoRetrying ? handleRetry : undefined}
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
                  onResend={message.role === 'user' ? handleResend : undefined}
                />
              ))}
              
              {/* Typing Indicator - Show only when streaming and no content yet */}
              {isStreaming && streamedContent === '' && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-gray-100 dark:bg-slate-800/60 text-gray-900 dark:text-slate-100 p-3 rounded-lg rounded-bl-sm transition-colors duration-300">
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
      <div className={`fixed bottom-0 right-0 backdrop-blur-sm border-t z-30 lg:block hidden transition-all duration-300 ${
        isSidebarHidden ? 'left-0' : 'left-80'
      } bg-white/95 dark:bg-slate-900/95 border-gray-200/50 dark:border-slate-700/50`}>
        <div className="max-w-4xl mx-auto">
          {/* Input Area */}
          <div className="p-4">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0 ? "Ask me anything..." : "Continue the conversation..."}
                      disabled={isStreaming || !isOnline}
                  className="w-full min-h-[52px] max-h-32 px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl resize-none overflow-hidden transition-colors duration-300 bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400"
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={isStreaming ? handleStop : () => handleSend()}
                      disabled={!isStreaming && (!inputValue.trim() || !isOnline)}
                      className={`h-12 w-12 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex-shrink-0 transition-all duration-200 ${
                        isStreaming 
                          ? 'bg-amber-500 hover:bg-amber-600' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      aria-label={isStreaming ? "Stop streaming" : "Send message"}
                    >
                      {isStreaming ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12v12H6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isStreaming ? "Stop streaming" : "Send message"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
              <span>Gemini can make mistakes. Consider checking important information.</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Input Container - Full width on mobile */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t z-30 lg:hidden transition-all duration-300 bg-white/95 dark:bg-slate-900/95 border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto">
          {/* Input Area */}
          <div className="p-4">
            <div className="flex w-full gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0 ? "Ask me anything..." : "Continue the conversation..."}
                      disabled={isStreaming || !isOnline}
                  className="w-full min-h-[52px] max-h-32 px-4 py-3 border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed rounded-xl resize-none overflow-hidden transition-colors duration-300 bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-400"
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={isStreaming ? handleStop : () => handleSend()}
                      disabled={!isStreaming && (!inputValue.trim() || !isOnline)}
                      className={`h-12 w-12 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex-shrink-0 transition-all duration-200 ${
                        isStreaming 
                          ? 'bg-amber-500 hover:bg-amber-600' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      aria-label={isStreaming ? "Stop streaming" : "Send message"}
                    >
                      {isStreaming ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12v12H6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isStreaming ? "Stop streaming" : "Send message"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
              <span>Gemini can make mistakes. Consider checking important information.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

