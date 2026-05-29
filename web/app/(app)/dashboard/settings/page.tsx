import { redirect } from 'next/navigation';
import { DataTrustNotice } from '@/components/trust/DataTrustNotice';
import { NewsletterUpsell } from '@/components/marketing/NewsletterUpsell';
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
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Account, notifications, and data privacy.</p>
      </header>

      <NewsletterUpsell />

      <form
        action={updateNotificationDefaults}
        className="glass flex flex-col gap-6 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold">Telegram alerts (optional)</h2>
        <p className="text-sm text-muted-foreground">
          Get a message when a manual search completes. Separate from the email newsletter.
        </p>
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

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          You can delete your account data as described in our{' '}
          <a href="/privacy" className="text-primary hover:underline">
            privacy policy
          </a>
          . Contact the operator of this deployment to request removal.
        </p>
        <form action={deleteAccount} className="mt-5 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <h3 className="text-sm font-semibold text-destructive">Delete account</h3>
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
    </section>
  );
}
