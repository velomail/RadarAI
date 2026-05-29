import { redirect } from 'next/navigation';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { OnboardingForm } from './OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { count } = await sb
    .from('search_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count && count > 0) redirect('/dashboard');

  return <OnboardingForm />;
}
