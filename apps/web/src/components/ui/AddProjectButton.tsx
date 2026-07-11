"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AddProjectButton({ onSuccess }: { onSuccess?: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Brand Campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `proj-${Date.now()}`;
      const res = await fetch(`${apiUrl}/cms/admin/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          slug,
          category,
          mediaType: 'video',
          isFeatured: true,
          client: 'Corporate Client'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create portfolio item');
      }

      toast.success('Project created successfully');
      setIsModalOpen(false);
      setTitle('');
      if (onSuccess) onSuccess();
      else if (typeof window !== 'undefined') window.location.reload();
    } catch (err) {
      toast.error('Error creating project in CMS');
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
                  className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                >
                  <option value="Brand Campaign">Brand Campaign</option>
                  <option value="Short Film">Short Film</option>
                  <option value="Music Video">Music Video</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Fashion">Fashion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Media Upload</label>
                <div className="border-2 border-dashed border-[var(--color-border)] p-6 text-center text-muted-foreground text-sm">
                  Drag and drop video/images here
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
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
