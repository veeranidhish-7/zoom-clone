export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--white)] text-[var(--text-body)]">
      {/* Wide sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[var(--sidebar-web)] border-r border-[var(--divider)] py-6 flex flex-col">
        <div className="px-6 mb-8 text-[var(--text-heading)] font-semibold text-lg">
          Zoom
        </div>
        <nav className="flex flex-col text-sm">
          <div className="px-6 py-3 bg-[var(--sidebar-selected)] text-[var(--blue-button)] border-l-4 border-[var(--blue-button)] font-semibold cursor-pointer">
            Meetings
          </div>
          <div className="px-6 py-3 text-[var(--text-sidebar)] hover:bg-[#E5E7EB] ml-1 border-l-4 border-transparent font-medium cursor-pointer">
            Webinars
          </div>
          <div className="px-6 py-3 text-[var(--text-sidebar)] hover:bg-[#E5E7EB] ml-1 border-l-4 border-transparent font-medium cursor-pointer">
            Personal Contacts
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white p-8">
        {children}
      </main>
    </div>
  );
}
