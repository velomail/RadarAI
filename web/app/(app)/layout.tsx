import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Radar } from 'lucide-react';
import { AppNav } from '@/components/layout/AppNav';
import { MockModeBanner } from '@/components/layout/MockModeBanner';
import { APP_NAME } from '@/lib/brand';
import { SEARCH_PAGE } from '@/lib/constants';
import { supabaseServer } from '@/lib/supabase/server';
import { signOut } from '../(auth)/actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="gradient-mesh flex min-h-screen flex-col">
      <MockModeBanner />
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-8">
            <Link href={SEARCH_PAGE} className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg transition-colors group-hover:bg-primary/30" />
                <Radar className="relative h-6 w-6 text-primary" />
              </div>
              <span>{APP_NAME}</span>
            </Link>
            <AppNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground md:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-muted-foreground hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-12 md:px-8">
        {children}
      </main>
    </div>
  );
}
