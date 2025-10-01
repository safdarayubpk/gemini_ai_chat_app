"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({ onNewChat, isOpen, onToggle }: ChatSidebarProps) {
  const [chats] = useState([
    { id: '1', title: 'Help with React hooks', time: '2 hours ago' },
    { id: '2', title: 'Explain quantum computing', time: '1 day ago' },
    { id: '3', title: 'Write a Python script', time: '3 days ago' },
  ]);

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
        fixed top-0 left-0 h-full w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Chats</h2>
              <Button
                onClick={onNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 h-8 text-sm"
                aria-label="Start new chat"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New
              </Button>
            </div>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="w-full p-3 rounded-lg hover:bg-slate-700/50 transition-colors group cursor-pointer"
                  onClick={() => {
                    // Handle chat selection
                    console.log('Selected chat:', chat.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open chat: ${chat.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      console.log('Selected chat:', chat.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-slate-100 truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {chat.time}
                      </p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-all"
                      aria-label={`Delete chat: ${chat.title}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent click
                        console.log('Delete chat:', chat.id);
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
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300">
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
