import Link from 'next/link';
import { AuthHashRedirect } from '@/components/auth/AuthHashRedirect';
import { LocalAuthNotice } from '@/components/auth/LocalAuthNotice';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { formatAuthError } from '@/lib/auth-errors';
import { safeAuthRedirect } from '@/lib/auth-utils';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

interface PageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const redirectTo = safeAuthRedirect(sp.redirect);

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <AuthHashRedirect />
      <AuthPageShell>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
          Sign in to continue your job search.
        </p>

        <div className="mt-8 lg:mt-10">
          {sp.error ? (() => {
            const { title, detail } = formatAuthError(sp.error);
            return (
              <div className="mb-4 border border-border px-3 py-2.5 text-sm sm:text-base">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-muted-foreground">{detail}</p>
              </div>
            );
          })() : null}

          <LocalAuthNotice show={!!sp.error} />
          <OAuthButtons redirectTo={redirectTo} />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground sm:text-base">
          New here?{' '}
          <Link href="/sign-up" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </p>

        <p className="mt-10 text-center text-xs text-muted-foreground sm:text-sm">
          Your resume stays private. Delete your data anytime from Settings.
        </p>
      </AuthPageShell>
    </main>
  );
}
