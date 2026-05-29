import Link from 'next/link';
import { Radar } from 'lucide-react';
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { formatAuthError } from '@/lib/auth-errors';
import { SEARCH_PAGE } from '@/lib/constants';

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  return (
    <main className="gradient-mesh relative flex min-h-screen flex-col">
      <AuthHashRedirect />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float-delayed absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <header className="relative z-10 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg transition-colors group-hover:bg-primary/30" />
              <Radar className="relative h-7 w-7 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">RadarAI</span>
          </Link>
        </div>
      </header>
      <section className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Save resume-backed searches and run them whenever you&apos;re job hunting.
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            {sp.error ? (() => {
              const { title, detail } = formatAuthError(sp.error);
              return (
                <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <p className="font-medium">{title}</p>
                  <p className="mt-1 text-destructive/90">{detail}</p>
                </div>
              );
            })() : null}

            <OAuthButtons redirectTo={SEARCH_PAGE} />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already signed up?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
