'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { fetchAPI } from '@/lib/api-client';

/**
 * Accept / decline actions for an inbound hire request. Calls the talent-guarded
 * PATCH /talent/hire-requests/:id endpoint and refreshes the dashboard on success.
 */
export function HireRequestActions({
  requestId,
  status,
}: {
  requestId: string;
  status?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<null | 'CONFIRMED' | 'DECLINED'>(null);

  const alreadyResolved = status === 'CONFIRMED' || status === 'DECLINED';

  const respond = async (next: 'CONFIRMED' | 'DECLINED') => {
    setPending(next);
    try {
      await fetchAPI(`/talent/hire-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      toast.success(next === 'CONFIRMED' ? 'Request accepted' : 'Request declined');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update request');
    } finally {
      setPending(null);
    }
  };

  if (alreadyResolved) {
    return (
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {status === 'CONFIRMED' ? 'Accepted' : 'Declined'}
      </span>
    );
  }

  return (
    <div className="flex gap-4">
      <Button size="sm" variant="primary" disabled={pending !== null} onClick={() => respond('CONFIRMED')}>
        {pending === 'CONFIRMED' ? 'Accepting…' : 'Accept Request'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending !== null}
        className="text-red-600 hover:bg-red-600 hover:text-white border-red-600"
        onClick={() => respond('DECLINED')}
      >
        {pending === 'DECLINED' ? 'Declining…' : 'Decline'}
      </Button>
    </div>
  );
}
