import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-[34px] leading-[1.1] font-extrabold tracking-tight sm:text-[40px]">
          {title}
        </h1>
        {description && <p className="text-muted-foreground text-[17px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
