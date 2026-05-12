import { Logo } from '@/shared/ui/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55rem 36rem at 50% -12%, oklch(0.96 0.045 158 / 0.55), transparent 70%), radial-gradient(36rem 28rem at 100% 110%, oklch(0.95 0.05 56 / 0.4), transparent 70%)',
        }}
        aria-hidden
      />
      <div className="reveal relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo withWordmark />
        </div>
        {children}
      </div>
    </div>
  );
}
