'use client';

import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
