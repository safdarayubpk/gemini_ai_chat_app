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
      {/* Sidebar - Fixed from top to bottom */}
      <ChatSidebar 
        onNewChat={handleNewChat} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Header - Fixed at top of main content */}
      <div className="fixed top-0 left-80 right-0 z-40 lg:block hidden">
        <Header />
      </div>
      
      {/* Mobile Header - Full width on mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <Header />
      </div>
      
      {/* Chat Window - Takes remaining space */}
      <div className="h-full pt-20 lg:pl-80">
        <ChatWindow />
      </div>
    </div>
  );
}
