import { redirect } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';

/** Legacy URL — new searches are created on the main search page. */
export default function NewSearchRedirect() {
  redirect(SEARCH_PAGE);
}
