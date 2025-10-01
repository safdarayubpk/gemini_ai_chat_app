import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Greeting Header */}
      <Header />
      
      {/* Quick Action Cards */}
      <QuickActions />
      
      {/* Chat Area Placeholder */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">
            Start a conversation or choose an action above
          </p>
        </div>
      </div>
    </div>
  );
}
