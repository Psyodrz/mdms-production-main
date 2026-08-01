"use client";

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';
import { cms } from '@/lib/cms/client';

export function AddProjectButton({ onSuccess }: { onSuccess?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [category, setCategory] = useState('Brand Campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Upload server-side (service-role) so it works regardless of bucket RLS
      // policies. Returns a permanent public URL.
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'portfolio');
      const res = await fetch('/api/cms/upload', { method: 'POST', body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !json?.url) {
        throw new Error(json?.error || 'Upload failed');
      }
      setMediaUrl(json.url);
      setUploadedName(file.name);
      toast.success('Media uploaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setIsUploading(false);
      // allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    if (!mediaUrl.trim()) {
      toast.error('Please provide a media URL for the project');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `proj-${Date.now()}`;

      // Go through the same-origin CMS BFF (NextAuth session → service account),
      // exactly like the rest of the CMS. This avoids the browser-token 401 that
      // a direct call to the NestJS API hits. Payload matches UpsertPortfolioDto.
      const res = await cms.create('portfolio', {
        title: title.trim(),
        slug,
        category,
        mediaUrl: mediaUrl.trim(),
        mediaType: 'video',
        isPublished: true,
      });
      if (!res.ok) {
        throw new Error(res.error || 'Failed to create portfolio item');
      }

      toast.success('Project created successfully');
      setIsModalOpen(false);
      setTitle('');
      setMediaUrl('');
      if (onSuccess) onSuccess();
      else if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      // fetchAPI throws with the API's real message (e.g. validation/auth errors)
      const message = err instanceof Error ? err.message : 'Error creating project in CMS';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors"
      >
        + Add Project
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 max-w-lg w-full rounded-sm shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-muted-foreground hover:text-black transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-serif text-foreground mb-6">Add New Portfolio Project</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                  placeholder="e.g. Neon City Commercial"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--color-base)] text-foreground border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none [color-scheme:dark]"
                >
                  <option className="bg-[#111] text-white" value="Brand Campaign">Brand Campaign</option>
                  <option className="bg-[#111] text-white" value="Short Film">Short Film</option>
                  <option className="bg-[#111] text-white" value="Music Video">Music Video</option>
                  <option className="bg-[#111] text-white" value="Commercial">Commercial</option>
                  <option className="bg-[#111] text-white" value="Fashion">Fashion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Media Upload</label>

                {/* Direct file upload → Supabase storage → permanent URL */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] p-6 rounded text-center text-sm text-muted-foreground transition-colors flex flex-col items-center gap-2 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading…
                    </>
                  ) : uploadedName ? (
                    <>
                      <UploadCloud className="w-5 h-5 text-green-500" />
                      <span className="text-foreground">{uploadedName}</span>
                      <span className="text-xs">Click to replace</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      <span>Click to upload video / image</span>
                    </>
                  )}
                </button>

                {mediaUrl && !isUploading ? (
                  <p className="mt-2 text-xs text-green-600 break-all">Uploaded: {mediaUrl}</p>
                ) : null}

                <div className="mt-3">
                  <label className="block text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">or paste a media URL</label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => { setMediaUrl(e.target.value); setUploadedName(''); }}
                    className="w-full bg-[var(--color-base)] text-foreground border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none"
                    placeholder="https://... (video or image URL)"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : isUploading ? (
                  'Uploading…'
                ) : (
                  'Save Project'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
