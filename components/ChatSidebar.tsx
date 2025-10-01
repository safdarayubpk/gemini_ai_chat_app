"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface Chat {
  id: string;
  title: string;
  time: string;
  lastMessage?: string;
  createdAt: Date;
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
  const { theme } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chat-history');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt)
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    const date = chat.createdAt.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem('chat-history', JSON.stringify(updatedChats));
  };

  const handleChatSelect = (chatId: string) => {
    onChatSelect?.(chatId);
    onToggle(); // Close sidebar on mobile
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
        bg-slate-800/95 dark:bg-slate-800/95 light:bg-gray-100/95
        border-slate-700/50 dark:border-slate-700/50 light:border-gray-200/50
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isHidden ? 'lg:-translate-x-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 dark:border-slate-700/50 light:border-gray-200/50 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200/50 rounded-lg transition-colors duration-300"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-300 light:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-slate-100 dark:text-slate-100 light:text-gray-900 transition-colors duration-300">Chats</h2>
            </div>
            
            <Button
              onClick={() => {
                setIsCreatingNewChat(true);
                onNewChat();
                // Reset loading state after a short delay
                setTimeout(() => setIsCreatingNewChat(false), 500);
              }}
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
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 hover:text-slate-300"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
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
                          key={chat.id}
                          className={`w-full p-3 rounded-lg transition-colors group cursor-pointer ${
                            currentChatId === chat.id 
                              ? 'bg-blue-600/20 border border-blue-500/30' 
                              : 'hover:bg-slate-700/50'
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
                              <h4 className={`text-sm font-medium truncate ${
                                currentChatId === chat.id ? 'text-blue-200' : 'text-slate-200 group-hover:text-slate-100'
                              }`}>
                                {chat.title}
                              </h4>
                              {chat.lastMessage && (
                                <p className="text-xs text-slate-400 mt-1 truncate">
                                  {chat.lastMessage}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">
                                {chat.time}
                              </p>
                            </div>
                            <button
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-all"
                              aria-label={`Delete chat: ${chat.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                              }}
                            >
                              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
                onClick={() => {
                  // Focus search input
                  setShowSearch(true);
                  setTimeout(() => {
                    const searchInput = document.querySelector('input[placeholder="Search chats..."]') as HTMLInputElement;
                    searchInput?.focus();
                  }, 100);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </div>
                  <kbd className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">⌘K</kbd>
                </div>
              </button>
              
              <button 
                className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300"
                onClick={() => console.log('Settings clicked')}
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
                onClick={() => console.log('Help clicked')}
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
    </>
  );
}
