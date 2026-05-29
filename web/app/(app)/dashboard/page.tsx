import { SearchPageContent } from '@/components/searches/SearchPageContent';

interface PageProps {
  searchParams: Promise<{ run?: string; error?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <SearchPageContent searchParams={sp} />;
}
