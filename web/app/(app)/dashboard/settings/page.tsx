import { redirect } from 'next/navigation';
import { DataTrustNotice } from '@/components/trust/DataTrustNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabaseServer, supabaseServiceRole } from '@/lib/supabase/server';
import { deleteAccount, updateNotificationDefaults } from './actions';

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const sb = supabaseServiceRole();
  const { data: profile } = await sb
    .from('search_profiles')
    .select('notify_telegram_chat_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex w-full flex-col gap-8 lg:gap-10">
      <header>
        <h2 className="text-lg font-semibold tracking-tight lg:text-2xl">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-base">
          Notifications, privacy, and account management.
        </p>
      </header>

      <form
        action={updateNotificationDefaults}
        className="surface flex flex-col gap-6 rounded-lg p-6 lg:gap-8 lg:p-8"
      >
        <div>
          <h2 className="text-lg font-semibold lg:text-xl">Telegram alerts</h2>
          <p className="mt-1 text-sm text-muted-foreground lg:text-base">
            Optional message when a search completes.
          </p>
        </div>
        <div>
          <Label htmlFor="notify_telegram_chat_id">Telegram chat ID</Label>
          <Input
            id="notify_telegram_chat_id"
            name="notify_telegram_chat_id"
            defaultValue={profile?.notify_telegram_chat_id ?? ''}
            className="mt-1"
            placeholder="from @userinfobot"
          />
        </div>
        <Button type="submit" size="lg" className="self-start">
          Save
        </Button>
      </form>

      <DataTrustNotice />

      <section className="surface rounded-lg p-6 lg:p-8">
        <h2 className="text-lg font-semibold lg:text-xl">Signed in</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:text-base">{user.email}</p>
        <p className="mt-3 text-sm text-muted-foreground lg:text-base">
          Delete your account data as described in our{' '}
          <a href="/privacy" className="font-medium text-foreground underline">
            privacy policy
          </a>
          .
        </p>
        <form action={deleteAccount} className="mt-6 border border-border p-4">
          <h3 className="text-sm font-semibold">Delete account</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently removes your account and related data. Type DELETE to confirm.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input id="confirmation" name="confirmation" placeholder="DELETE" className="mt-1" />
            </div>
            <Button type="submit" variant="danger">
              Delete account
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
