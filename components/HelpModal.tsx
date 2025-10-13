"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const keyboardShortcuts = [
    { key: '⌘K', description: 'Focus search' },
    { key: '⌘B', description: 'Toggle sidebar' },
    { key: 'Enter', description: 'Send message' },
    { key: 'Shift + Enter', description: 'New line in message' },
    { key: 'Escape', description: 'Cancel editing' },
  ];

  const features = [
    {
      title: 'Chat Management',
      items: [
        'Click "New Chat" to start a fresh conversation',
        'Click on any chat title to rename it',
        'Pin important chats to keep them at the top',
        'Delete chats by hovering and clicking the trash icon',
        'Search through your chat history'
      ]
    },
    {
      title: 'Message Features',
      items: [
        'Edit your messages by clicking the pencil icon',
        'Copy any message using the clipboard icon',
        'Messages are automatically saved to your browser',
        'AI responses include proper error handling'
      ]
    },
    {
      title: 'Settings & Customization',
      items: [
        'Toggle between light and dark themes',
        'Set chat history limits',
        'Enable/disable auto-delete for old chats',
        'Clear all data if needed'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 dark:border-slate-700/50 border-gray-200/50">
          <h2 className="text-lg font-semibold text-slate-100 dark:text-slate-100 text-gray-900">
            Help & FAQ
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-gray-200/50 rounded-lg transition-colors"
            aria-label="Close help"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Welcome */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-slate-200 mb-2">
              Welcome to Gemini AI Chat
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 text-gray-600">
              Your intelligent AI assistant powered by Google&apos;s Gemini API
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 dark:bg-slate-700/30 bg-gray-100 rounded-lg">
                  <span className="text-sm text-slate-300 dark:text-slate-300 text-gray-600">
                    {shortcut.description}
                  </span>
                  <kbd className="text-xs bg-slate-600 dark:bg-slate-600 bg-gray-200 text-slate-300 dark:text-slate-300 text-gray-700 px-2 py-1 rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-slate-300 dark:text-slate-300 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/30 dark:bg-slate-700/30 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-1">
                  How do I save my conversations?
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-600">
                  All conversations are automatically saved to your browser&apos;s local storage. No account required!
                </p>
              </div>
              <div className="p-3 bg-slate-700/30 dark:bg-slate-700/30 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-1">
                  Can I use this offline?
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-600">
                  You can view your chat history offline, but you&apos;ll need an internet connection to get AI responses.
                </p>
              </div>
              <div className="p-3 bg-slate-700/30 dark:bg-slate-700/30 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-1">
                  Is my data secure?
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-600">
                  Yes! All data is stored locally in your browser and never sent to external servers except for AI processing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-slate-700/50 dark:border-slate-700/50 border-gray-200/50">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
