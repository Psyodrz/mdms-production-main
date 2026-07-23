"use client";

import React, { useState, useRef } from 'react';
import { uploadToSupabase } from '@/lib/upload';
import { toast } from 'sonner';

export function UploadVersionUI({
  projectId,
  accessToken,
  nextVersionNumber
}: {
  projectId: string;
  accessToken: string;
  nextVersionNumber: number;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Step 1: Upload file to Supabase Storage
      const url = await uploadToSupabase({
        file,
        bucket: 'mp-private',
        folder: `projects/${projectId}`,
      });

      // Step 2: Register version in NestJS database
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mp-backend-api.onrender.com/api/v1';
      const versionRes = await fetch(`${apiUrl}/editor/projects/${projectId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileUrl: url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          versionNumber: nextVersionNumber,
        }),
      });

      if (!versionRes.ok) {
        throw new Error('Failed to register the new version on the server.');
      }

      setStatus('success');
      toast.success(`Version v${nextVersionNumber} uploaded successfully!`);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center border-dashed relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="video/mp4,video/x-m4v,video/*" 
        onChange={handleFileChange}
      />
      
      {!isUploading ? (
        <>
          <p className="text-muted-foreground mb-4 font-light">Drag and drop new video versions here</p>
          <button 
            onClick={handleUploadClick}
            className="px-6 py-2 bg-primary text-white uppercase tracking-widest text-xs font-semibold hover:bg-primary/80 transition-colors"
          >
            Upload New Version (v{nextVersionNumber})
          </button>
        </>
      ) : (
        <div className="w-full max-w-md mx-auto">
          <p className="text-foreground mb-2 font-semibold">Uploading version v{nextVersionNumber}…</p>
          <div className="w-full bg-border h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full animate-pulse rounded-full" 
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">Please wait while the file is being uploaded to Supabase Storage.</p>
        </div>
      )}

      {status === 'success' && (
        <p className="text-emerald-500 text-xs font-semibold mt-4">Version v{nextVersionNumber} uploaded successfully!</p>
      )}

      {status === 'error' && (
        <p className="text-red-500 text-xs font-semibold mt-4">{errorMessage}</p>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-left border-t border-[var(--color-border)] pt-4">
        * Uploads are sent securely via Supabase Storage. Ensure your proxy is heavily compressed (H.264/WebM) before uploading for client review.
      </p>
    </div>
  );
}

