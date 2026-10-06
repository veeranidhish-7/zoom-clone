import Link from 'next/link';

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-4">Welcome to Zoom Meetings!</h2>
      <p className="text-[var(--text-body)] max-w-lg mb-6">
        Schedule new and manage existing meetings all in one place. You are currently limited to 40 minutes per meeting. Upgrade now if you need more time. <a href="#" className="text-[var(--blue-button)] hover:underline">Learn More</a>
      </p>
      <div className="flex gap-4">
        <Link href="/meetings/schedule" className="bg-[var(--blue-web-tile)] text-white px-6 py-2 rounded font-medium hover:opacity-90 transition">
          Schedule a Meeting
        </Link>
        <button className="border border-[var(--divider)] text-[var(--text-body)] px-6 py-2 rounded font-medium hover:bg-gray-50 transition">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};
