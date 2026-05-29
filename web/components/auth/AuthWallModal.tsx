'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type AuthWallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
};

export function AuthWallModal({
  open,
  onOpenChange,
  redirectPath = '/demo',
}: AuthWallModalProps) {
  const redirect = encodeURIComponent(redirectPath);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-primary bg-gradient-to-b from-card to-primary/5 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Create a free account to continue
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            You&apos;ve used your one guest search. Sign up free for up to 3 searches per day with
            full AI insights on every match.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <Link href={`/sign-up?redirect=${redirect}`} className="w-full">
              <Button size="lg" className="group h-12 w-full rounded-xl text-base">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href={`/sign-in?redirect=${redirect}`} className="w-full">
              <Button variant="outline" size="lg" className="h-11 w-full rounded-xl">
                Sign in
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
