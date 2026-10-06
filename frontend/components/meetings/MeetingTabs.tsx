import React from 'react';
import Link from 'next/link';

interface MeetingTabsProps {
  activeTab: 'upcoming' | 'previous';
}

export const MeetingTabs: React.FC<MeetingTabsProps> = ({ activeTab }) => {
  return (
    <div className="flex space-x-6 border-b border-[var(--divider)] mb-6 text-sm font-medium">
      <Link href="/meetings" className={`pb-3 border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-[var(--blue-tile)] text-[var(--blue-tile)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)]'}`}>
        Upcoming
      </Link>
      <Link href="/meetings?tab=previous" className={`pb-3 border-b-2 transition-colors ${activeTab === 'previous' ? 'border-[var(--blue-tile)] text-[var(--blue-tile)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)]'}`}>
        Previous
      </Link>
    </div>
  );
};
