import { redirect } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';

export default function OnboardingRedirect() {
  redirect(SEARCH_PAGE);
}
