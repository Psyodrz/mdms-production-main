'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function PendingTalentActions({ talentId, onSuccess }: { talentId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleModerate = async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!confirm(`Are you sure you want to ${status === 'ACTIVE' ? 'approve' : 'reject'} this profile?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/talent/${talentId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to moderate profile');
      toast.success(`Profile ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully`);
      if (onSuccess) onSuccess();
      else router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to moderate profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        onClick={() => handleModerate('ACTIVE')} 
        variant="primary" 
        size="sm" 
        disabled={loading}
        className="flex items-center gap-1.5"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Approve'}
      </Button>
      <Button 
        onClick={() => handleModerate('SUSPENDED')} 
        variant="outline" 
        size="sm" 
        disabled={loading}
        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white flex items-center gap-1.5"
      >
        Reject
      </Button>
    </div>
  );
}
