import { redirect } from 'next/navigation';

import { AppNavProvider } from '@/components/layout/AppNavContext';

import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

import { RecentSearchesSheet } from '@/components/layout/RecentSearchesSheet';

import { supabaseServer } from '@/lib/supabase/server';



export default async function AppLayout({ children }: { children: React.ReactNode }) {

  const supabase = await supabaseServer();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');



  return (

    <AppNavProvider>

      <div className="flex h-dvh flex-col overflow-hidden bg-background">

        <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>

        <RecentSearchesSheet />

        <MobileBottomNav />

      </div>

    </AppNavProvider>

  );

}

