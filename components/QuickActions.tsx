"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'write',
    title: 'Write',
    description: 'Draft an email, story, or poem',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: 'plan',
    title: 'Plan',
    description: 'Create a trip itinerary or meal plan',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'code',
    title: 'Code',
    description: 'Debug, explain, or write code',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function QuickActions() {
  const { theme } = useTheme();
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className="group p-6 rounded-2xl border transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 hover:border-slate-600/50 dark:hover:border-slate-600/50 light:hover:border-gray-300 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-900 light:focus:ring-offset-white"
            onClick={action.onClick}
            aria-label={`${action.title}: ${action.description}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 bg-slate-700/50 dark:bg-slate-700/50 light:bg-gray-200 group-hover:bg-slate-600/50 dark:group-hover:bg-slate-600/50 light:group-hover:bg-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-600 group-hover:text-slate-200 dark:group-hover:text-slate-200 light:group-hover:text-gray-700">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium transition-colors duration-300 text-slate-200 dark:text-slate-200 light:text-gray-800 group-hover:text-slate-100 dark:group-hover:text-slate-100 light:group-hover:text-gray-900">
                  {action.title}
                </h3>
                <p className="text-sm transition-colors duration-300 mt-1 text-slate-400 dark:text-slate-400 light:text-gray-600 group-hover:text-slate-300 dark:group-hover:text-slate-300 light:group-hover:text-gray-700">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
