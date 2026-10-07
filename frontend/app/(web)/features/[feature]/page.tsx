import { ComingSoon } from '@/components/ui/ComingSoon';
import { Box } from 'lucide-react';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ feature: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { feature } = await params;
  const title = feature.charAt(0).toUpperCase() + feature.slice(1);
  return { title: `${title} - Zoom` };
}

export default async function FeaturePage({ params }: Props) {
  const { feature } = await params;
  const title = feature.charAt(0).toUpperCase() + feature.slice(1);
  
  return (
    <ComingSoon 
      title={title} 
      icon={<Box size={32} strokeWidth={1.5} />} 
    />
  );
}
