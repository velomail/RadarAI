import { redirect } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';

interface PageProps {
  searchParams: Promise<{ run?: string; error?: string }>;
}

/** Legacy entry — canonical search UI lives at /dashboard/searches. */
export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.run) q.set('run', sp.run);
  if (sp.error) q.set('error', sp.error);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  redirect(`${SEARCH_PAGE}${suffix}`);
}
