"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [chatHistoryLimit, setChatHistoryLimit] = useState(50);
  const [autoDelete, setAutoDelete] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLimit = localStorage.getItem('chat-history-limit');
      const savedAutoDelete = localStorage.getItem('auto-delete-chats');
      const savedNotifications = localStorage.getItem('chat-notifications');

      if (savedLimit) setChatHistoryLimit(parseInt(savedLimit));
      if (savedAutoDelete) setAutoDelete(savedAutoDelete === 'true');
      if (savedNotifications) setNotifications(savedNotifications === 'true');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-history-limit', chatHistoryLimit.toString());
      localStorage.setItem('auto-delete-chats', autoDelete.toString());
      localStorage.setItem('chat-notifications', notifications.toString());
    }
  };

  const handleSave = () => {
    saveSettings();
    onClose();
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all chat data? This action cannot be undone.')) {
      // Use the centralized clearing function
      import('@/lib/localStorage').then(({ clearAppLocalStorage }) => {
        clearAppLocalStorage();
        window.location.reload();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 dark:bg-slate-800 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 dark:border-slate-700/50 border-gray-200/50">
          <h2 className="text-lg font-semibold text-slate-100 dark:text-slate-100 text-gray-900">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-gray-200/50 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Chat Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
              Chat History
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 dark:text-slate-300 text-gray-600 mb-2">
                  Maximum chats to keep
                </label>
                <select
                  value={chatHistoryLimit}
                  onChange={(e) => setChatHistoryLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700/50 dark:bg-slate-700/50 bg-gray-100 border border-slate-600 dark:border-slate-600 border-gray-300 rounded-lg text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25 chats</option>
                  <option value={50}>50 chats</option>
                  <option value={100}>100 chats</option>
                  <option value={200}>200 chats</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 dark:text-slate-300 text-gray-600">
                  Auto-delete old chats
                </span>
                <button
                  onClick={() => setAutoDelete(!autoDelete)}
                  className={`w-12 h-6 rounded-full transition-colors ${autoDelete
                      ? 'bg-blue-600'
                      : 'bg-slate-600 dark:bg-slate-600 bg-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoDelete ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 dark:text-slate-300 text-gray-600">
                  Chat notifications
                </span>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${notifications
                      ? 'bg-blue-600'
                      : 'bg-slate-600 dark:bg-slate-600 bg-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
              Data Management
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleClearAllData}
                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                Clear All Chat Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50 dark:border-slate-700/50 border-gray-200/50">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-slate-400 hover:text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
