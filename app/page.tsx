import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Greeting Header */}
      <Header />
      
      {/* Quick Action Cards */}
      <QuickActions />
      
      {/* Chat Window */}
      <div className="flex-1 p-4">
        <ChatWindow />
      </div>
    </div>
  );
}
