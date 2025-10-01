import React from 'react';

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div 
      className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-3"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 w-5 h-5 mt-0.5">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-red-200 mb-1">
          Something went wrong
        </h3>
        <p className="text-sm text-red-300 mb-2">
          {error}
        </p>
        
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-200 bg-red-800/30 hover:bg-red-800/50 border border-red-600/30 hover:border-red-600/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Retry sending the last message"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md"
              aria-label="Dismiss error message"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
