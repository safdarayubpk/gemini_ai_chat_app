"use client";

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export default function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 bg-white text-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/50 dark:bg-slate-800/50 bg-gray-100 border border-slate-700/50 dark:border-slate-700/50 border-gray-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 018 0z" 
                />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-slate-100 dark:text-slate-100 text-gray-900 mb-2">
              Application Error
            </h1>
            
            <p className="text-slate-300 dark:text-slate-300 text-gray-600 mb-6">
              A critical error occurred in the application. Please refresh the page or contact support.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
