"use client";

import React from 'react';

interface HeaderProps {
  isSidebarHidden?: boolean;
}

export default function Header({ isSidebarHidden = false }: HeaderProps) {
  return (
    <header className="h-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 flex items-center">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
            aria-label="Open sidebar"
            onClick={() => {
              const event = new CustomEvent('toggleSidebar');
              window.dispatchEvent(event);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop Sidebar Toggle Button */}
          <button
            className="hidden lg:block p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
            aria-label={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
            onClick={() => {
              const event = new CustomEvent('hideSidebar');
              window.dispatchEvent(event);
            }}
          >
            {isSidebarHidden ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
          
          <h1 className="text-xl font-semibold text-slate-100">Gemini AI Chat</h1>
        </div>
        <button 
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Toggle theme"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
  );
}