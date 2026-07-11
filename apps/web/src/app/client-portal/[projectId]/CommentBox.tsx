'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { fetchAPI } from '@/lib/api-client';
import { uploadToSupabase } from '@/lib/upload';

export function CommentBox({ projectId, versionId }: { projectId: string; versionId?: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToSupabase({
        file,
        bucket: 'mp-private',
        folder: `client-docs/${projectId}`,
      });
      setAttachmentUrl(url);
      setAttachmentName(file.name);
      toast.success('File attached successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const post = async () => {
    if (!content.trim() && !attachmentUrl) return;
    setSubmitting(true);
    try {
      await fetchAPI(`/client/projects/${projectId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          versionId,
          ...(attachmentUrl && { attachmentUrl }),
        }),
      });
      setContent('');
      removeAttachment();
      toast.success('Comment posted');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 bg-surface border border-border p-4 space-y-3">
      <div className="flex gap-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') post(); }}
          placeholder="Leave feedback on this version…"
          className="flex-1 bg-transparent border-b border-border text-foreground focus:outline-none focus:border-primary px-2"
        />
        <Button variant="primary" size="sm" onClick={post} disabled={submitting || uploading}>
          {submitting ? 'Posting…' : 'Post'}
        </Button>
      </div>

      {/* Attachment area */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,video/*"
          className="hidden"
          onChange={handleAttachment}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          {uploading ? 'Uploading…' : 'Attach file'}
        </button>

        {attachmentName && (
          <span className="text-xs text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md">
            📎 {attachmentName}
            <button
              type="button"
              onClick={removeAttachment}
              className="text-muted-foreground hover:text-destructive ml-1"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

