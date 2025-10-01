import React from 'react';

export default function TypingIndicator() {
  return (
    <div 
      className="flex items-center gap-1 p-3"
      aria-live="polite"
      role="status"
      aria-label="Assistant is typing"
    >
      <div 
        className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: '150ms' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}
