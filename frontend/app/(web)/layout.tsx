'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  type?: 'header' | 'link';
  label: string;
  href?: string;
  badge?: string;
};

const webNavItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { type: 'header', label: 'My Products' },
  { label: 'AI', href: '/features/ai', badge: 'New' },
  { label: 'Meetings', href: '/meetings' },
  { label: 'Recordings', href: '/features/recordings' },
  { label: 'Summaries', href: '/features/summaries' },
  { label: 'Hub', href: '/features/hub', badge: 'New' },
  { label: 'Whiteboards', href: '/features/whiteboards' },
  { label: 'Notes', href: '/features/notes' },
  { label: 'Clips', href: '/features/clips' },
  { label: 'Canvas', href: '/features/canvas' },
  { label: 'Paper', href: '/features/paper' },
  { label: 'Sheets', href: '/features/sheets' },
  { label: 'Slides', href: '/features/slides' },
  { label: 'Tasks', href: '/features/tasks' },
  { label: 'Scheduler', href: '/features/scheduler' },
  { label: 'Discover More Products', href: '/features/products' },
  { type: 'header', label: 'My Account' },
  { label: 'Admin', href: '/features/admin' },
  { label: 'Support', href: '/features/support' },
  // Explicit items requested
  { type: 'header', label: 'Other' },
  { label: 'Webinars', href: '/webinars' },
  { label: 'Personal Contacts', href: '/features/contacts' },
];

export default function WebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[var(--white)] text-[var(--text-body)]">
      {/* Wide sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[var(--sidebar-web)] border-r border-[var(--divider)] py-6 flex flex-col overflow-y-auto">
        <Link href="/" className="px-6 mb-4 text-[var(--text-heading)] font-semibold text-2xl hover:opacity-80 transition block text-[var(--blue-button)]">
          zoom
        </Link>
        <nav className="flex flex-col text-sm pb-8">
          {webNavItems.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={`header-${idx}`} className="px-6 mt-6 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {item.label}
                </div>
              );
            }

            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href || ''));
            return (
              <Link
                key={`link-${idx}`}
                href={item.href || '#'}
                className={`flex items-center justify-between px-6 py-2.5 font-medium cursor-pointer transition focus:outline-none focus:bg-[#E5E7EB] ${
                  isActive
                    ? 'bg-[var(--sidebar-selected)] text-[var(--blue-button)] border-l-4 border-[var(--blue-button)] font-semibold'
                    : 'text-[var(--text-sidebar)] hover:bg-[#E5E7EB] ml-1 border-l-4 border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] border border-[var(--blue-button)] text-[var(--blue-button)] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white p-8">
        {children}
      </main>
    </div>
  );
}
