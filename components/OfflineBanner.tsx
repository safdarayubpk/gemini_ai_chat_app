import React from 'react';

export default function OfflineBanner() {
  return (
    <div 
      className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4 flex items-center gap-3"
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 w-5 h-5">
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-medium text-yellow-200 mb-1">
          You're offline
        </h3>
        <p className="text-sm text-yellow-300">
          Check your internet connection. Messages will be sent when you're back online.
        </p>
      </div>
    </div>
  );
}
