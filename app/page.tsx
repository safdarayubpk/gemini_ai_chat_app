"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatWindow from '@/components/ChatWindow';
import ChatSidebar from '@/components/ChatSidebar';
// import LocalStorageDebug from '@/components/LocalStorageDebug';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('current-chat');

  const handleNewChat = () => {
    // Generate unique chat ID
    const newChatId = `chat-${Date.now()}`;
    
    // Dispatch event to clear chat messages
    const event = new CustomEvent('newChat');
    window.dispatchEvent(event);
    
    // Update current chat ID to new unique ID
    setCurrentChatId(newChatId);
    
    // Close sidebar on mobile after new chat
    setSidebarOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Listen for sidebar toggle events from header
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };

    const handleHideSidebar = () => {
      setSidebarHidden(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    window.addEventListener('hideSidebar', handleHideSidebar);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
      window.removeEventListener('hideSidebar', handleHideSidebar);
    };
  }, []);

  // Keyboard shortcut for hiding sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarHidden(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ensure page scrolls to top on load/refresh
  useEffect(() => {
    // Simple scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
        <div className="h-screen bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
          {/* Sidebar - Fixed from top to bottom */}
          <ChatSidebar 
            onNewChat={handleNewChat} 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isHidden={sidebarHidden}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
          />
      
      {/* Header - Fixed at top of main content */}
      <div className={`fixed top-0 right-0 z-40 lg:block hidden transition-all duration-300 ${
        sidebarHidden ? 'left-0' : 'left-80'
      }`}>
        <Header isSidebarHidden={sidebarHidden} />
      </div>
      
      {/* Mobile Header - Full width on mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <Header isSidebarHidden={false} />
      </div>
      
      {/* Chat Window - Takes remaining space */}
      <div className={`h-full pt-20 transition-all duration-300 ${
        sidebarHidden ? 'lg:pl-0' : 'lg:pl-80'
      }`}>
        <ChatWindow isSidebarHidden={sidebarHidden} currentChatId={currentChatId} />
      </div>
      
      {/* LocalStorage Debug - Only in development */}
      {/* <LocalStorageDebug /> */}
    </div>
  );
}
