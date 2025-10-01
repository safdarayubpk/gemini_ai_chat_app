import React from 'react';

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "Safdar" }: HeaderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-100 mb-2">
          Hello, {userName}
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light">
          How can I help you today?
        </p>
      </div>
    </div>
  );
}
