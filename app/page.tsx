export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">
          Welcome to Gemini AI Chat
        </h2>
        <p className="text-slate-400 mb-8">
          Your AI-powered conversation partner is ready to help.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="quick-action-card">
            <h3 className="font-medium text-slate-200 mb-2">Start a conversation</h3>
            <p className="text-sm text-slate-400">Ask me anything you'd like to know</p>
          </div>
          <div className="quick-action-card">
            <h3 className="font-medium text-slate-200 mb-2">Get creative</h3>
            <p className="text-sm text-slate-400">Write stories, poems, or brainstorm ideas</p>
          </div>
          <div className="quick-action-card">
            <h3 className="font-medium text-slate-200 mb-2">Learn something new</h3>
            <p className="text-sm text-slate-400">Explore topics and expand your knowledge</p>
          </div>
          <div className="quick-action-card">
            <h3 className="font-medium text-slate-200 mb-2">Solve problems</h3>
            <p className="text-sm text-slate-400">Get help with coding, math, or analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
