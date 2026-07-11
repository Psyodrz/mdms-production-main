'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function PendingTalentActions({ talentId, onSuccess }: { talentId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )mdms_auth_token=([^;]+)'));
    if (match) return match[2];
    return localStorage.getItem('token') || localStorage.getItem('mdms_auth_token');
  };

  const handleModerate = async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!confirm(`Are you sure you want to ${status === 'ACTIVE' ? 'approve' : 'reject'} this profile?`)) return;
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = getToken();
      const res = await fetch(`${apiUrl}/talent/${talentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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
