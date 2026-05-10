import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card p-4">
      <Link href="/" className="mb-6 px-2 text-lg font-bold tracking-tight">
        Expense Tracker
      </Link>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
      <div className="mt-4">
        <SidebarUser />
      </div>
    </aside>
  );
}
