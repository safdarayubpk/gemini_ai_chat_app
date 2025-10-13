"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getLocalStorageItem, setLocalStorageItem, isValidMessage } from '@/lib/localStorage';
import SettingsModal from '@/components/SettingsModal';
import HelpModal from '@/components/HelpModal';
// import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  timestamp?: number; // Full timestamp for proper date handling
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  isPinned?: boolean;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isHidden?: boolean;
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export default function ChatSidebar({ onNewChat, isOpen, onToggle, isHidden = false, currentChatId, onChatSelect }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce search query for better performance
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate chat title from first user message (Gemini-style)
  const generateChatTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    
    // Clean and truncate the title (Gemini uses ~40-60 characters)
    const title = firstUserMessage.content.trim();
    
    // Remove common prefixes and clean up
    const cleanTitle = title
      .replace(/^(please|can you|could you|help me|i need|how do|what is|explain)/i, '')
      .trim();
    
    // Truncate to 45 characters for better display
    const finalTitle = cleanTitle.length > 45 ? cleanTitle.substring(0, 45) + '...' : cleanTitle;
    
    return finalTitle || 'New Chat';
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200/20 text-yellow-100 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Load chats from localStorage and convert messages to chat format
  const loadChats = useCallback(() => {
    try {
      const allChats: Chat[] = [];
      const seenChatIds = new Set<string>();
      
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage not available');
        setChats([]);
        return;
      }
      
      // Get all chat-related keys
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(key => key.startsWith('chat-messages'));
      
      // Sort keys to prioritize newer chats over legacy ones
      const sortedChatKeys = chatKeys.sort((a, b) => {
        // Put legacy 'chat-messages' at the end
        if (a === 'chat-messages') return 1;
        if (b === 'chat-messages') return -1;
        return 0;
      });
      
      // Load all chat-specific keys (including legacy 'chat-messages')
      sortedChatKeys.forEach(key => {
        try {
          let chatId: string;
          let savedMessages: Message[];
          
          if (key === 'chat-messages') {
            // Legacy key - only load if no newer chats exist
            chatId = 'current-chat';
            savedMessages = getLocalStorageItem<Message[]>(key, []);
          } else {
            // New chat-specific key
            chatId = key.replace('chat-messages-', '');
            savedMessages = getLocalStorageItem<Message[]>(key, []);
          }
          
          // Skip if we've already seen this chat ID
          if (seenChatIds.has(chatId)) {
            console.warn(`Skipping duplicate chat ID: ${chatId}`);
            return;
          }
          
          if (savedMessages && savedMessages.length > 0) {
            const validMessages = savedMessages.filter(isValidMessage);
            
            if (validMessages.length > 0) {
              const chatCreatedAt = validMessages[0]?.timestamp ? new Date(validMessages[0].timestamp) : new Date();
              const customTitle = localStorage.getItem(`chat-custom-title-${chatId}`) || 
                                 (chatId === 'current-chat' ? localStorage.getItem('chat-custom-title') : null);
              const isPinned = localStorage.getItem(`chat-pinned-${chatId}`) === 'true' ||
                              (chatId === 'current-chat' ? localStorage.getItem('chat-pinned') === 'true' : false);

              const chat: Chat = {
                id: chatId,
                title: customTitle || generateChatTitle(validMessages),
                lastMessage: validMessages[validMessages.length - 1]?.content || '',
                createdAt: chatCreatedAt,
                isPinned
              };
              allChats.push(chat);
              seenChatIds.add(chatId);
            }
          }
        } catch (error) {
          console.warn(`Error loading chat from key ${key}:`, error);
        }
      });
      
      setChats(allChats);
      
      // Clean up any duplicate data in localStorage
      if (seenChatIds.has('current-chat') && chatKeys.some(key => key !== 'chat-messages' && key.startsWith('chat-messages-'))) {
        console.log('Cleaning up legacy chat data...');
        // Remove legacy data if we have newer chats
        localStorage.removeItem('chat-messages');
        localStorage.removeItem('chat-custom-title');
        localStorage.removeItem('chat-pinned');
      }
    } catch (error) {
      console.error('Error loading chats from localStorage:', error);
      setChats([]);
    }
  }, []);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Listen for new chat events to refresh the chat list
  useEffect(() => {
    const handleNewChat = () => {
      loadChats();
      // Clear search when new chat is created
      setSearchQuery('');
      setDebouncedSearchQuery('');
    };

    const handleMessageUpdate = () => {
      // Only reload chats if not currently searching to avoid interrupting user
      if (!searchQuery.trim()) {
        loadChats();
      }
    };

    window.addEventListener('newChat', handleNewChat);
    window.addEventListener('messageUpdate', handleMessageUpdate);
    
    return () => {
      window.removeEventListener('newChat', handleNewChat);
      window.removeEventListener('messageUpdate', handleMessageUpdate);
    };
  }, [loadChats, searchQuery]);

  // Debounce search query for better performance
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Show searching state immediately
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSearchError(null); // Clear any previous search errors
      setIsSearching(false);
    }, 300); // 300ms debounce delay
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Keyboard shortcut for search (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search chats"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter and sort chats with memoization for better performance
  const filteredChats = useMemo(() => {
    try {
      // Ensure we have chats to work with
      if (!chats || chats.length === 0) {
        return [];
      }

      if (!debouncedSearchQuery.trim()) {
        // Return all chats sorted when no search query
        return [...chats].sort((a, b) => {
          // Pinned chats first
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          // Then by date (newest first)
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      }

      const query = debouncedSearchQuery.toLowerCase().trim();
      
      // More robust filtering with better error handling
      const filtered = chats.filter(chat => {
        try {
          // Ensure chat object is valid
          if (!chat || typeof chat !== 'object') {
            return false;
          }

          // Check title match
          const titleMatch = chat.title && 
            typeof chat.title === 'string' && 
            chat.title.toLowerCase().includes(query);

          // Check last message match
          const messageMatch = chat.lastMessage && 
            typeof chat.lastMessage === 'string' && 
            chat.lastMessage.toLowerCase().includes(query);

          return titleMatch || messageMatch;
        } catch (error) {
          console.warn('Error filtering chat:', error, chat);
          return false;
        }
      });

      // Sort filtered results with relevance scoring
      return filtered.sort((a, b) => {
        // Pinned chats first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then by relevance (title matches first, then message matches)
        const aTitleMatch = a.title?.toLowerCase().includes(query);
        const bTitleMatch = b.title?.toLowerCase().includes(query);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // Finally by date (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    } catch (error) {
      console.error('Error filtering chats:', error);
      setSearchError('Search failed. Please try again.');
      return chats || []; // Fallback to all chats or empty array
    }
  }, [chats, debouncedSearchQuery]);

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    try {
      const date = chat.createdAt.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
    } catch (error) {
      console.warn('Error grouping chat by date:', error);
      // Fallback to today's date
      const today = new Date().toDateString();
      if (!groups[today]) {
        groups[today] = [];
      }
      groups[today].push(chat);
    }
    return groups;
  }, {} as Record<string, Chat[]>);

  const handleDeleteChat = (chatId: string) => {
    // Find the chat to get its title for confirmation
    const chatToDelete = chats.find(chat => chat.id === chatId);
    const chatTitle = chatToDelete?.title || 'this chat';
    
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`)) {
      try {
        // Remove chat-specific messages from localStorage
        const chatKey = `chat-messages-${chatId}`;
        localStorage.removeItem(chatKey);
        
        // Remove chat-specific custom title and pinned state
        localStorage.removeItem(`chat-custom-title-${chatId}`);
        localStorage.removeItem(`chat-pinned-${chatId}`);
        
        // If it's the current chat, also clear legacy storage and trigger new chat
        if (chatId === 'current-chat') {
          setLocalStorageItem('chat-messages', []);
          localStorage.removeItem('chat-custom-title');
          localStorage.removeItem('chat-pinned');
          onNewChat(); // Trigger new chat
        }
        
        // Update the chats list by removing the deleted chat
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        console.log(`✅ Deleted chat: ${chatId} - "${chatTitle}"`);
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  const handleChatSelect = (chatId: string) => {
    onChatSelect?.(chatId);
    onToggle(); // Close sidebar on mobile
  };

  const handleNewChatClick = () => {
    setIsCreatingNewChat(true);
    onNewChat();
    // Reset loading state after a short delay
    setTimeout(() => setIsCreatingNewChat(false), 500);
  };

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingChatId && editingTitle.trim()) {
      setChats(prev => prev.map(chat => 
        chat.id === editingChatId 
          ? { ...chat, title: editingTitle.trim() }
          : chat
      ));
      
      // Save to localStorage
      const savedMessages = getLocalStorageItem<Message[]>('chat-messages', []);
      if (savedMessages.length > 0) {
        // Store custom title in localStorage
        localStorage.setItem('chat-custom-title', editingTitle.trim());
      }
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleTogglePin = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    ));
    
    // Save pin state to localStorage
    const isPinned = chats.find(chat => chat.id === chatId)?.isPinned;
    localStorage.setItem('chat-pinned', (!isPinned).toString());
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-80 backdrop-blur-sm border-r z-50
        bg-slate-800/95 dark:bg-slate-800/95 bg-gray-100/95
        border-slate-700/50 dark:border-slate-700/50 border-gray-200/50
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isHidden ? 'lg:-translate-x-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 dark:border-slate-700/50 border-gray-200/50 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-gray-200/50 rounded-lg transition-colors duration-300"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-300 text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-slate-100 dark:text-slate-100 text-gray-900 transition-colors duration-300">Chats</h2>
            </div>
            
                <Button
                  onClick={handleNewChatClick}
                  disabled={isCreatingNewChat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 h-12 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Start new chat"
                >
                  {isCreatingNewChat ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {isCreatingNewChat ? 'Creating...' : 'New Chat'}
                </Button>
            
            {/* Search */}
            <div className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    setSearchError(null); // Clear errors on input change
                  }}
                  onKeyDown={(e) => {
                    // Allow Escape to clear search
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                    }
                  }}
                  className="w-full px-3 py-2 pl-9 pr-16 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                  aria-label="Search chats"
                  aria-describedby="search-help"
                  autoComplete="off"
                  spellCheck="false"
                />
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 hover:text-slate-300"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-2 text-xs bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">⌘K</kbd>
                )}
              </div>
              
              {/* Search Error Display */}
              {searchError && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">{searchError}</p>
                </div>
              )}
              
                  {/* Search Results Count */}
                  {debouncedSearchQuery && (
                    <div className="mt-2 text-xs text-slate-400">
                      {filteredChats.length === 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709" />
                          </svg>
                          No chats found for &quot;{debouncedSearchQuery}&quot;
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''} found
                        </span>
                      )}
                    </div>
                  )}
            </div>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center">
                {searchQuery ? (
                  <div className="text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">No chats found</p>
                    <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs text-slate-500 mt-1">Start a new chat to begin</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                {Object.entries(groupedChats).map(([date, dateChats]) => (
                  <div key={date} className="mb-4">
                    <h3 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                      {date === new Date().toDateString() ? 'Today' : 
                       date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : 
                       new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    <div className="space-y-1">
                      {dateChats.map((chat) => (
                        <div
                          key={`${chat.id}-${chat.createdAt.getTime()}`}
                          className={`w-full p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                            currentChatId === chat.id 
                              ? 'bg-blue-600/20 border border-blue-500/30 shadow-lg' 
                              : 'hover:bg-slate-700/50 border border-transparent hover:border-slate-600/30'
                          }`}
                          onClick={() => handleChatSelect(chat.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Open chat: ${chat.title}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleChatSelect(chat.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                {editingChatId === chat.id ? (
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    className="w-full px-2 py-1 text-sm bg-slate-700/50 dark:bg-slate-700/50 bg-gray-100 border border-blue-500/50 rounded text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <h4 
                                      className={`text-sm font-medium truncate flex-1 cursor-pointer ${
                                        currentChatId === chat.id ? 'text-blue-200' : 'text-slate-200 group-hover:text-slate-100'
                                      }`}
                                      onClick={() => handleStartEdit(chat.id, chat.title)}
                                      title="Click to rename"
                                    >
                                      {debouncedSearchQuery ? highlightSearchTerm(chat.title, debouncedSearchQuery) : chat.title}
                                    </h4>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => handleStartEdit(chat.id, chat.title)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600/50 rounded transition-all"
                                            aria-label="Rename chat"
                                          >
                                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Rename chat</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                )}
                              </div>
                              {chat.lastMessage && (
                                <p className="text-xs text-slate-400 mt-1 truncate leading-relaxed">
                                  {debouncedSearchQuery ? (
                                    highlightSearchTerm(
                                      chat.lastMessage.length > 60 
                                        ? chat.lastMessage.substring(0, 60) + '...' 
                                        : chat.lastMessage,
                                      debouncedSearchQuery
                                    )
                                  ) : (
                                    chat.lastMessage.length > 60 
                                      ? chat.lastMessage.substring(0, 60) + '...' 
                                      : chat.lastMessage
                                  )}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-500">
                                  {(() => {
                                    try {
                                      const now = new Date();
                                      const chatDate = chat.createdAt;
                                      const diffTime = now.getTime() - chatDate.getTime();
                                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                      
                                      if (diffDays === 0) {
                                        return 'Today';
                                      } else if (diffDays === 1) {
                                        return 'Yesterday';
                                      } else if (diffDays < 7) {
                                        return chatDate.toLocaleDateString('en-US', { weekday: 'short' });
                                      } else {
                                        return chatDate.toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric'
                                        });
                                      }
                                    } catch (error) {
                                      console.warn('Error formatting date:', error);
                                      return 'Today';
                                    }
                                  })()}
                                </p>
                                {currentChatId === chat.id && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-blue-400">Active</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-600/50 rounded-md transition-all duration-200 hover:scale-105"
                                      aria-label={`${chat.isPinned ? 'Unpin' : 'Pin'} chat: ${chat.title}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(chat.id);
                                      }}
                                    >
                                      <svg className={`w-3.5 h-3.5 transition-colors ${
                                        chat.isPinned 
                                          ? 'text-yellow-400' 
                                          : 'text-slate-400 hover:text-yellow-400'
                                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                      </svg>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{chat.isPinned ? 'Unpin chat' : 'Pin chat'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-600/50 rounded-md transition-all duration-200 hover:scale-105"
                                      aria-label={`Delete chat: ${chat.title}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(chat.id);
                                      }}
                                    >
                                      <svg className="w-3.5 h-3.5 text-slate-400 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete chat</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="space-y-2">
              <button 
                className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300"
                onClick={() => setShowSettings(true)}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </div>
              </button>
              
              <button 
                className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300"
                onClick={() => setShowHelp(true)}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & FAQ
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </>
  );
}
