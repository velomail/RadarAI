import { signOut } from '@/app/(auth)/actions';
import { SEARCH_PAGE } from '@/lib/constants';
import { AppBrandLink } from './AppBrandLink';

type Props = {
  title: string;
  email?: string | null;
};

export function AppHeader({ title, email }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-5 lg:h-16 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <AppBrandLink className="shrink-0" size="lg" href={SEARCH_PAGE} />
        <span aria-hidden className="text-muted-foreground/40">
          /
        </span>
        <h1 className="truncate text-sm font-medium tracking-tight text-muted-foreground lg:text-base">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {email ? (
          <span className="hidden max-w-[220px] truncate text-muted-foreground md:inline">
            {email}
          </span>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
