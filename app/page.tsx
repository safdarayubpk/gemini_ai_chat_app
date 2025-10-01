"use client";

import React, { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-900">
      {/* Header */}
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <ChatSidebar 
          onNewChat={handleNewChat} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
