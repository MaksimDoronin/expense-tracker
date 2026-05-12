import { RequireAuth } from '@/features/auth/ui/require-auth';
import { Sidebar } from './_components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="bg-shell text-foreground flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="border-border bg-panel min-h-screen rounded-l-[2rem] border-l shadow-[var(--shadow-panel)]">
            <div className="mx-auto w-full max-w-4xl px-6 py-9 sm:px-10 sm:py-12 xl:max-w-[1196px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
