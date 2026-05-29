import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ run?: string; error?: string }>;
}

/** Legacy URL — job search lives on /dashboard only. */
export default async function SearchesRedirect({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.run) q.set('run', sp.run);
  if (sp.error) q.set('error', sp.error);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  redirect(`/dashboard${suffix}`);
}
