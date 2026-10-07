'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';

import { Home, MessageSquare, Video, Users, ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react';

const workplaceNavItems = [
  { label: 'Home', href: '/', icon: Home, isActive: (pathname: string) => pathname === '/' },
  { label: 'Chat', href: '/chat', icon: MessageSquare, isActive: (pathname: string) => pathname?.startsWith('/chat') },
  { label: 'Meetings', href: '/meetings', icon: Video, isActive: (pathname: string) => pathname?.startsWith('/meetings') },
  { label: 'Contacts', href: '/contacts', icon: Users, isActive: (pathname: string) => pathname?.startsWith('/contacts') },
];

export default function WorkplaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [me, setMe] = useState<{name?: string, email?: string} | null>(null);
  
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showGearMenu, setShowGearMenu] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    api.getMe().then(data => {
      if (mounted) setMe(data as {name?: string, email?: string});
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
      if (gearRef.current && !gearRef.current.contains(e.target as Node)) {
        setShowGearMenu(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAvatarMenu(false);
        setShowGearMenu(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/meetings?q=${encodeURIComponent(searchQuery)}`);
  };

  const handlePlaceholderClick = (name: string) => {
    toast(`${name} clicked!`);
    setShowAvatarMenu(false);
    setShowGearMenu(false);
  };

  return (
    <div className="flex h-screen bg-white text-[var(--text-body)]">
      {/* Narrow sidebar */}
      <aside className="w-[72px] flex-shrink-0 bg-[var(--sidebar-wp)] border-r border-[var(--divider)] flex flex-col items-center py-4 gap-6">
        {workplaceNavItems.map((item, idx) => {
          const active = item.isActive(pathname || '');
          const Icon = item.icon;
          return (
            <Link 
              key={`nav-${idx}`}
              href={item.href} 
              className={`flex flex-col items-center gap-1 cursor-pointer transition group focus:outline-none ${
                active ? 'text-blue-600' : 'text-[var(--text-sidebar)] hover:text-[var(--text-body)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                active ? 'bg-white shadow-sm ring-1 ring-black/5' : 'group-hover:bg-[#E5E7EB] active:bg-[#D1D5DB]'
              }`}>
                <Icon size={24} strokeWidth={active ? 2.5 : 1.5} className={active ? 'fill-current opacity-20 text-blue-600' : ''} />
                {active && <Icon size={24} strokeWidth={2.5} className="absolute text-blue-600" />}
              </div>
              <span className={`text-[11px] ${active ? 'font-medium' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-[var(--divider)] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => router.back()}
                className="w-7 h-7 rounded-full hover:bg-[var(--divider)] active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--blue-button)] flex items-center justify-center cursor-pointer text-[var(--text-muted)] transition-colors"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => router.forward()}
                className="w-7 h-7 rounded-full hover:bg-[var(--divider)] active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--blue-button)] flex items-center justify-center cursor-pointer text-[var(--text-muted)] transition-colors"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} strokeWidth={2} />
              </div>
              <input 
                type="text"
                placeholder="Search ⌘ + K"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-8 bg-[var(--search-fill)] border border-[var(--divider)] rounded-md flex items-center pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--blue-button)] text-[var(--text-body)] placeholder-gray-400"
              />
            </form>
          </div>
          <div className="flex items-center gap-4 relative">
            <div ref={gearRef} className="relative">
              <button 
                onClick={() => setShowGearMenu(!showGearMenu)}
                className="w-8 h-8 rounded-full hover:bg-[var(--divider)] active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--blue-button)] flex items-center justify-center cursor-pointer text-[var(--text-muted)] transition-colors"
              >
                <Settings size={20} strokeWidth={1.5} />
              </button>
              {showGearMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-[var(--divider)] rounded-lg shadow-lg py-1 z-50">
                  <button onClick={() => handlePlaceholderClick('General Settings')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">General</button>
                  <button onClick={() => handlePlaceholderClick('Video Settings')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">Video</button>
                  <button onClick={() => handlePlaceholderClick('Audio Settings')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">Audio</button>
                </div>
              )}
            </div>
            <div ref={avatarRef} className="relative">
              <button 
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="w-8 h-8 rounded-md bg-[var(--avatar-purple)] text-white flex items-center justify-center font-semibold text-sm cursor-pointer hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--blue-button)] transition-all"
              >
                {me?.name ? me.name[0].toUpperCase() : 'A'}
              </button>
              {showAvatarMenu && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-[var(--divider)] rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-[var(--divider)] mb-1">
                    <div className="font-semibold text-sm truncate">{me?.name || 'Demo User'}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{me?.email || 'demo@example.com'}</div>
                  </div>
                  <button onClick={() => handlePlaceholderClick('Profile')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">Profile</button>
                  <button onClick={() => handlePlaceholderClick('Sign Out')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-red-600">Sign Out</button>
                </div>
              )}
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
