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
    // Simple scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Fixed from top to bottom */}
        <ChatSidebar 
          onNewChat={handleNewChat} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header - Fixed at top */}
          <div className="fixed top-0 right-0 left-0 lg:left-80 z-40">
            <Header />
          </div>
          
          {/* Chat Window - Takes remaining space with proper padding */}
          <div className="flex-1 pt-20">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}
