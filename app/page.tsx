"use client";

import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen flex">
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
  );
}
