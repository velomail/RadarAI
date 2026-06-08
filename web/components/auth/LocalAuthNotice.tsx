'use client';

import { useEffect, useState } from 'react';

type Props = {
  /** Show setup hint after a failed sign-in (not on every localhost visit). */
  show?: boolean;
};

export function LocalAuthNotice({ show = false }: Props) {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    setIsLocal(window.location.hostname === 'localhost');
  }, []);

  if (!isLocal || !show) return null;

  return (
    <p className="mb-4 border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
      <span className="font-medium text-foreground">Local OAuth setup:</span> In Supabase → URL
      Configuration, set Site URL to{' '}
      <span className="font-mono text-foreground">http://localhost:3000</span> and add{' '}
      <span className="font-mono text-foreground">http://localhost:3000/auth/callback</span> to
      Redirect URLs. Run the app on port 3000 and use the buttons below (not a bookmarked provider
      URL). See <span className="font-mono">docs/AUTH_OAUTH_SETUP.md</span>.
    </p>
  );
}
