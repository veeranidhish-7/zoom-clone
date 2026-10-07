import { ComingSoon } from '@/components/ui/ComingSoon';
import { Users } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacts - Zoom',
};

export default function ContactsPage() {
  return (
    <ComingSoon 
      title="Contacts" 
      icon={<Users size={32} strokeWidth={1.5} />} 
    />
  );
}
