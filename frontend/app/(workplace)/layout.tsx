'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WorkplaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomeActive = pathname === '/';
  const isMeetingsActive = pathname?.startsWith('/meetings');

  return (
    <div className="flex h-screen bg-white text-[var(--text-body)]">
      {/* Narrow sidebar */}
      <aside className="w-[72px] flex-shrink-0 bg-[var(--sidebar-wp)] border-r border-[var(--divider)] flex flex-col items-center py-4 gap-6">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
            isHomeActive ? 'text-[var(--blue-tile)]' : 'text-[var(--text-sidebar)] hover:text-[var(--text-body)]'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isHomeActive ? 'bg-[var(--blue-tint)]' : 'group-hover:bg-[#E5E7EB]'
          }`}>
            <div className={`w-5 h-5 rounded-sm ${isHomeActive ? 'bg-[var(--blue-tile)]' : 'bg-[var(--text-sidebar)]'}`} />
          </div>
          <span className={`text-[11px] ${isHomeActive ? 'font-medium' : ''}`}>Home</span>
        </Link>
        
        <div className="flex flex-col items-center gap-1 text-[var(--text-sidebar)] hover:text-[var(--text-body)] cursor-pointer group transition">
          <div className="w-10 h-10 flex items-center justify-center group-hover:bg-[#E5E7EB] rounded-xl transition-colors">
            <div className="w-5 h-5 bg-[var(--text-sidebar)] rounded-sm" />
          </div>
          <span className="text-[11px]">Chat</span>
        </div>
        
        <Link 
          href="/meetings" 
          className={`flex flex-col items-center gap-1 cursor-pointer transition group ${
            isMeetingsActive ? 'text-[var(--blue-tile)]' : 'text-[var(--text-sidebar)] hover:text-[var(--text-body)]'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isMeetingsActive ? 'bg-[var(--blue-tint)]' : 'group-hover:bg-[#E5E7EB]'
          }`}>
            <div className={`w-5 h-5 rounded-sm ${isMeetingsActive ? 'bg-[var(--blue-tile)]' : 'bg-[var(--text-sidebar)]'}`} />
          </div>
          <span className={`text-[11px] ${isMeetingsActive ? 'font-medium' : ''}`}>Meetings</span>
        </Link>

        <div className="flex flex-col items-center gap-1 text-[var(--text-sidebar)] hover:text-[var(--text-body)] cursor-pointer group transition">
          <div className="w-10 h-10 flex items-center justify-center group-hover:bg-[#E5E7EB] rounded-xl transition-colors">
            <div className="w-5 h-5 bg-[var(--text-sidebar)] rounded-sm" />
          </div>
          <span className="text-[11px]">Contacts</span>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-[var(--divider)] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full hover:bg-[var(--divider)] flex items-center justify-center cursor-pointer text-[var(--text-muted)]">
                &larr;
              </div>
              <div className="w-7 h-7 rounded-full hover:bg-[var(--divider)] flex items-center justify-center cursor-pointer text-[var(--text-muted)]">
                &rarr;
              </div>
            </div>
            <div className="w-64 h-8 bg-[var(--search-fill)] border border-[var(--divider)] rounded-md flex items-center px-3 text-sm text-[var(--text-muted)]">
              Search
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full hover:bg-[var(--divider)] flex items-center justify-center cursor-pointer text-[var(--text-muted)]">
              ⚙️
            </div>
            <div className="w-8 h-8 rounded-md bg-[var(--avatar-purple)] text-white flex items-center justify-center font-semibold text-sm cursor-pointer">
              A
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
