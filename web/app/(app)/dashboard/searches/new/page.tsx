import { redirect } from 'next/navigation';

export default function NewSearchRedirect() {
  redirect('/dashboard');
}
