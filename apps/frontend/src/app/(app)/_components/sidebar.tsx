import Link from 'next/link';
import { Logo } from '@/shared/ui/logo';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[256px] shrink-0 flex-col gap-7 px-5 py-7">
      <Link href="/" className="px-1.5">
        <Logo withWordmark />
      </Link>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
      <SidebarUser />
    </aside>
  );
}
