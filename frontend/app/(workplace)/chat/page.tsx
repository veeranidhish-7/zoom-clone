import { ComingSoon } from '@/components/ui/ComingSoon';
import { MessageSquare } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - Zoom',
};

export default function ChatPage() {
  return (
    <ComingSoon 
      title="Team Chat" 
      icon={<MessageSquare size={32} strokeWidth={1.5} />} 
    />
  );
}
