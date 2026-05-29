import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

/** Consistent centered layout for all signed-in dashboard pages. */
export function DashboardPage({
  backHref,
  backLabel = 'Back',
  title,
  description,
  action,
  children,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {backHref ? (
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description ? <p className="mt-2 text-base text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </div>
  );
}
