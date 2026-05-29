import { redirect } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyProfileRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(SEARCH_PAGE);
}
