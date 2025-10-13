"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clipboard, Pencil, ArrowUp, X, Check } from 'lucide-react';
// import { useTheme } from '@/contexts/ThemeContext';

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  time?: string;
  onResend?: (editedContent: string) => void;
}

export default function MessageBubble({ role, content, time, onResend }: MessageBubbleProps) {
  const isUser = role === "user";
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Sync editedContent with content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSendEdit = () => {
    if (editedContent.trim() && editedContent !== content) {
      onResend?.(editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[70%] p-3 rounded-lg relative transition-all duration-300 group
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm' 
            : 'bg-slate-800/60 dark:bg-slate-800/60 light:bg-gray-100 text-slate-100 dark:text-slate-100 light:text-gray-900 rounded-bl-sm'
          }
        `}
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Action Bar - Bottom Right (Industry Standard) */}
        {!isEditing && (
          <TooltipProvider>
            <div className={`
              absolute bottom-2 right-2 transition-all duration-200 flex gap-1
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
            `}>
              {/* Copy Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="ghost"
                    className={`
                      h-6 w-6 p-0 rounded-md transition-all duration-200 hover:scale-105
                      ${isUser 
                        ? 'hover:bg-blue-500/20 text-blue-100 hover:text-white' 
                        : 'hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 text-slate-400 dark:text-slate-400 light:text-gray-500 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-gray-700'
                      }
                    `}
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Clipboard className="w-3 h-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isCopied ? "Copied!" : "Copy message"}
                </TooltipContent>
              </Tooltip>

              {/* Edit Button - Only for user messages */}
              {isUser && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleEdit}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 rounded-md transition-all duration-200 hover:scale-105 hover:bg-blue-500/20 text-blue-100 hover:text-white"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Edit message
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}

        {/* Message Content */}
        <div className={isEditing ? "pr-0" : "pb-8"}>
          {isEditing ? (
            /* Edit Mode */
            <TooltipProvider>
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[60px] max-h-32 px-3 py-2 text-sm bg-transparent border border-blue-400/30 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 text-white placeholder-blue-200/70 transition-all duration-200"
                  placeholder="Edit your message..."
                  autoFocus
                  style={{
                    height: 'auto',
                    minHeight: '60px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
                
                {/* Edit Action Buttons - Bottom Right */}
                <div className="flex gap-2 justify-end mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCancelEdit}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-blue-200 hover:text-white hover:bg-blue-500/20 transition-all duration-200 hover:scale-105"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Cancel editing
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSendEdit}
                        size="sm"
                        className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={!editedContent.trim() || editedContent.trim() === content}
                      >
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {!editedContent.trim() || editedContent.trim() === content 
                        ? "No changes to send" 
                        : "Send edited message"
                      }
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          ) : (
            /* Normal Mode */
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
