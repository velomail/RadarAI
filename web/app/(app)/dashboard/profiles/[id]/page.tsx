import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyProfileRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/dashboard/searches/${id}`);
}
