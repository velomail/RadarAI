import type { ReactNode } from 'react';
import { AppBrandLink } from '@/components/layout/AppBrandLink';

type Props = {
  children: ReactNode;
};

export function AuthPageShell({ children }: Props) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12"
      style={{
        paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="content-well w-full">
        <AppBrandLink size="lg" />
        <div className="surface mt-8 rounded-lg p-6 sm:mt-10 sm:p-8 lg:mt-12 lg:p-10 xl:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
