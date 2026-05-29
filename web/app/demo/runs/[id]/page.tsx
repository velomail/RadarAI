import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProductShell } from '@/components/layout/ProductShell';
import { supabaseServiceRole } from '@/lib/supabase/server';
import { RunPoller } from './RunPoller';

const DEMO_COOKIE = 'radar_demo_session';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoRunPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get(DEMO_COOKIE)?.value;

  const supabase = supabaseServiceRole();
  const { data: run } = await supabase.from('runs').select('*').eq('id', id).maybeSingle();
  if (!run) notFound();
  if (run.anonymous_session !== session) {
    return (
      <ProductShell cta={{ href: '/demo', label: 'Try again →' }}>
        <div className="glass py-16 text-center rounded-2xl">
          <h1 className="text-2xl font-bold">Run not found</h1>
          <p className="mt-2 text-muted-foreground">
            This demo run belongs to a different browser session.
          </p>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell cta={{ href: '/sign-up', label: 'Save these results →' }} maxWidth="4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Search results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked matches with role summaries and resume comparison
          </p>
        </div>
        <RunPoller runId={id} sessionHint="demo" tier="free" />
      </div>
    </ProductShell>
  );
}
