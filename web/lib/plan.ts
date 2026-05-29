import { supabaseServiceRole } from '@/lib/supabase/server';

export type UserPlan = 'free' | 'pro';

export async function getUserPlan(userId: string): Promise<UserPlan> {
  const sb = supabaseServiceRole();
  const { data } = await sb
    .from('user_usage')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.plan === 'pro' ? 'pro' : 'free';
}
