"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { logUserError } from '@/lib/error-logging';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    logUserError(error, 'App Error Page', {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 light:bg-white light:text-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 rounded-xl p-6 text-center">
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
        
        <h1 className="text-xl font-semibold text-slate-100 dark:text-slate-100 light:text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-slate-300 dark:text-slate-300 light:text-gray-600 mb-6">
          We encountered an unexpected error. This has been logged and we&apos;ll look into it.
        </p>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Go Home
          </Button>
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-gray-200 rounded-lg p-3 text-xs font-mono text-slate-300 dark:text-slate-300 light:text-gray-700 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="mb-2">
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
