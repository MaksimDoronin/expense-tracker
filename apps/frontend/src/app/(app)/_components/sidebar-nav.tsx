'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight, FolderTree, LayoutGrid, User, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact?: boolean;
}

const items: NavItem[] = [
  { href: '/', label: 'Главная', Icon: LayoutGrid, exact: true },
  { href: '/transactions', label: 'Транзакции', Icon: ArrowLeftRight },
  { href: '/categories', label: 'Категории', Icon: FolderTree },
  { href: '/profile', label: 'Профиль', Icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      <p className="text-muted-foreground/70 mb-1.5 px-3.5 text-[11px] font-bold tracking-[0.14em] uppercase">
        Обзор
      </p>
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition-all duration-150',
              active
                ? 'bg-card text-foreground shadow-[var(--shadow-pill)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.035]',
            )}
          >
            <Icon
              className={cn(
                'size-[18px] shrink-0 transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground/80 group-hover:text-foreground',
              )}
              strokeWidth={2}
              aria-hidden
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
