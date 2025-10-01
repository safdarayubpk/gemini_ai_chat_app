import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Chat Window with integrated header/quick actions */}
      <ChatWindow />
    </div>
  );
}
