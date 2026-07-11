'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Loader2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToSupabase } from '@/lib/upload';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaLibrary({ open, onOpenChange, onSelect }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  const fetchAssets = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/media?page=${p}&limit=12`);
      const json = await res.json();
      if (json.ok && json.data) {
        setAssets(json.data.data);
        setTotalPages(json.data.totalPages || 1);
        setPage(json.data.page || 1);
      } else {
        toast.error(json.error || 'Failed to load media assets.');
      }
    } catch {
      toast.error('Network error loading media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssets(page);
    }
  }, [open, page, fetchAssets]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only image and video uploads are allowed in the media library.');
      return;
    }
    setUploading(true);

    try {
      const folder = file.type.startsWith('video/') ? 'video' : 'gallery';
      const url = await uploadToSupabase({
        file,
        bucket: 'mp-cms',
        folder,
      });

      toast.success('Media uploaded successfully.');
      // Select the newly uploaded URL immediately for convenience
      onSelect(url);
      fetchAssets(1);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this media asset?')) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/media/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        toast.success('Asset deleted successfully.');
        fetchAssets(page);
      } else {
        toast.error(json.error || 'Failed to delete asset.');
      }
    } catch {
      toast.error('Network error during deletion.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] flex flex-col p-6 rounded-2xl overflow-hidden bg-background border border-border shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">Media Library</DialogTitle>
        </DialogHeader>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-4 border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => document.getElementById('media-library-upload-input')?.click()}
        >
          <input
            id="media-library-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">
                Drag and drop image here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground/80">Supports PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px] mt-6 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-sm">No media assets found. Upload your first image above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelect(asset.url)}
                  className="group relative aspect-square rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={(e) => handleDelete(asset.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
