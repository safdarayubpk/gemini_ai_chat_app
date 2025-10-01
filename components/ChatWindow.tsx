"use client";

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MessageBubble from '@/components/MessageBubble';

export default function ChatWindow() {
  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto">
      <Card className="flex flex-col h-full bg-slate-800/50 border-slate-700/50">
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <MessageBubble 
              role="user" 
              content="Hello! Can you help me write a Python function to calculate the factorial of a number?"
              time="2:30 PM"
            />
            
            <MessageBubble 
              role="assistant" 
              content={`Of course! Here's a Python function to calculate the factorial of a number:

\`\`\`python
def factorial(n):
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    elif n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

# Example usage:
print(factorial(5))  # Output: 120
\`\`\`

This function uses recursion to calculate the factorial. It handles edge cases for negative numbers and returns 1 for 0 and 1.`}
              time="2:31 PM"
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-slate-700/50 p-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Type your message here..."
              className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-blue-500"
            />
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
