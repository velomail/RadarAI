import { redirect } from 'next/navigation';

/** Legacy URL — advanced search settings live under Settings. */
export default function EditSearchRedirect() {
  redirect('/dashboard/settings/search');
}
