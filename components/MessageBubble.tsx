import React from 'react';

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export default function MessageBubble({ role, content, time }: MessageBubbleProps) {
  const isUser = role === "user";
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[70%] p-3 rounded-lg relative
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm' 
            : 'bg-slate-800/60 text-slate-100 rounded-bl-sm'
          }
        `}
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        {time && (
          <div className={`text-xs mt-1 opacity-70 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}
