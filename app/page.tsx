"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import ChatWindow from '@/components/ChatWindow';
import ChatSidebar from '@/components/ChatSidebar';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewChat = () => {
    // This will be handled by ChatWindow
    setSidebarOpen(false); // Close sidebar on mobile after new chat
  };

  // Listen for sidebar toggle events from header
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  // Ensure page scrolls to top on load/refresh
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Also ensure document body is at top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Prevent any scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Full height from top to bottom */}
        <ChatSidebar 
          onNewChat={handleNewChat} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header - Sticky within main content area */}
          <div className="sticky top-0 z-30">
            <Header />
          </div>
          
          {/* Chat Window - Takes remaining space */}
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
