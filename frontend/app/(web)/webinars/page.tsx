import { ComingSoon } from '@/components/ui/ComingSoon';
import { Presentation } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webinars - Zoom',
};

export default function WebinarsPage() {
  return (
    <ComingSoon 
      title="Webinars" 
      icon={<Presentation size={32} strokeWidth={1.5} />} 
    />
  );
}
