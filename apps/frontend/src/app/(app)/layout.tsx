import { RequireAuth } from '@/features/auth/ui/require-auth';
import { Sidebar } from './_components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-8 py-8">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
