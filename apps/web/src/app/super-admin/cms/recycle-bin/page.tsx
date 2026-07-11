'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RotateCcw, Trash2, Inbox, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cms } from '@/lib/cms/client';

type BinItem = Record<string, unknown> & { id: string; modelType: string };

const LABELS: Record<string, string> = {
  portfolioItem: 'Portfolio',
  blogPost: 'Blog',
  testimonial: 'Testimonial',
  teamMember: 'Team',
  faqItem: 'FAQ',
  service: 'Service',
  contactSubmission: 'Contact',
  announcement: 'Announcement',
};

function titleOf(item: BinItem): string {
  return String(
    item.title ?? item.name ?? item.question ?? item.clientName ?? item.text ?? item.email ?? item.id,
  );
}

export default function RecycleBinPage() {
  const [items, setItems] = useState<BinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purging, setPurging] = useState<BinItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cms.recycleBin<BinItem[]>();
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data);
      setError(null);
    } else {
      setItems([]);
      setError(res.error || 'Unable to load the recycle bin.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function restore(item: BinItem) {
    setBusy(item.id);
    const res = await cms.restore(item.modelType, item.id);
    setBusy(null);
    if (res.ok) {
      toast.success('Item restored');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      toast.error(res.error || 'Restore failed');
    }
  }

  async function purge() {
    if (!purging) return;
    const target = purging;
    setPurging(null);
    setBusy(target.id);
    const res = await cms.purge(target.modelType, target.id);
    setBusy(null);
    if (res.ok) {
      toast.success('Permanently deleted');
      setItems((prev) => prev.filter((i) => i.id !== target.id));
    } else {
      toast.error(res.error || 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-foreground">Recycle Bin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Restore deleted content or remove it permanently.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">The recycle bin is empty.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.modelType}-${item.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[var(--color-surface)] px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="secondary">{LABELS[item.modelType] ?? item.modelType}</Badge>
                <span className="truncate text-sm text-foreground">{titleOf(item)}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restore(item)}
                  disabled={busy === item.id}
                >
                  <RotateCcw className="size-4" /> Restore
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setPurging(item)}
                  disabled={busy === item.id}
                  aria-label="Delete permanently"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!purging} onOpenChange={(o) => !o && setPurging(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The item will be removed from the database for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={purge}
            >
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
