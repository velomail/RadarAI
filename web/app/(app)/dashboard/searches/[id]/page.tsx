import { redirect } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
}

/** Legacy per-profile URLs → unified searches page. */
export default async function LegacySearchProfileRedirect({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { run } = await searchParams;
  if (run) redirect(`${SEARCH_PAGE}?run=${run}`);
  redirect(SEARCH_PAGE);
}
