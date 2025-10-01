"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export default function MessageBubble({ role, content, time }: MessageBubbleProps) {
  const { theme } = useTheme();
  const isUser = role === "user";
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[70%] p-3 rounded-lg relative transition-colors duration-300
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm' 
            : 'bg-slate-800/60 dark:bg-slate-800/60 light:bg-gray-100 text-slate-100 dark:text-slate-100 light:text-gray-900 rounded-bl-sm'
          }
        `}
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        {time && (
          <div className={`text-xs mt-1 opacity-70 transition-colors duration-300 ${
            isUser 
              ? 'text-blue-100' 
              : 'text-slate-400 dark:text-slate-400 light:text-gray-500'
          }`}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}
