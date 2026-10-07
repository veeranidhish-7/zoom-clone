import React from 'react';
import Link from 'next/link';

interface MeetingTabsProps {
  activeTab: string;
}

export const MeetingTabs: React.FC<MeetingTabsProps> = ({ activeTab }) => {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', href: '/meetings' },
    { id: 'previous', label: 'Previous', href: '/meetings?tab=previous' },
    { id: 'attachments', label: 'Attachments', href: '/meetings?tab=attachments' },
    { id: 'personal', label: 'Personal Room', href: '/meetings?tab=personal' },
    { id: 'templates', label: 'Meeting Templates', href: '/meetings?tab=templates' },
    { id: 'agendas', label: 'Meeting Agendas', href: '/meetings?tab=agendas' },
  ];

  return (
    <div className="flex space-x-6 border-b border-[var(--divider)] mb-6 text-sm font-medium overflow-x-auto whitespace-nowrap">
      {tabs.map(tab => (
        <Link 
          key={tab.id}
          href={tab.href} 
          className={`pb-3 border-b-2 transition-colors focus:outline-none ${
            activeTab === tab.id 
              ? 'border-[var(--blue-button)] text-[var(--blue-button)]' 
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-body)]'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};
