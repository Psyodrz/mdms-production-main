import { CmsShell } from './cms/_components/CmsShell';
import { Toaster } from '@/components/ui/sonner';

export default function SuperAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsShell>{children}</CmsShell>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
