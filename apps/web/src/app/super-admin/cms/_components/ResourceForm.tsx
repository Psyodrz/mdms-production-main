'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { Upload, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldDef, ResourceConfig } from '@/lib/cms/resources';
import { uploadToSupabase } from '@/lib/upload';

interface ResourceFormProps {
  config: ResourceConfig;
  initial?: Record<string, unknown> | null;
  submitting?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}

function initialValue(field: FieldDef, initial?: Record<string, unknown> | null): string | boolean {
  const raw = initial?.[field.name];
  if (field.type === 'boolean') return Boolean(raw);
  if (raw === undefined || raw === null) return '';
  if (field.type === 'tags') return Array.isArray(raw) ? raw.join(', ') : String(raw);
  if (field.type === 'json') {
    try {
      return typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
    } catch {
      return '';
    }
  }
  if (field.type === 'date' && typeof raw === 'string') return raw.slice(0, 10);
  return String(raw);
}

export function ResourceForm({ config, initial, submitting, onSubmit, onCancel }: ResourceFormProps) {
  const fields = useMemo(() => config.fields, [config]);
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const v: Record<string, string | boolean> = {};
    for (const f of fields) v[f.name] = initialValue(f, initial);
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaCallback, setMediaCallback] = useState<((url: string) => void) | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const triggerMediaLibrary = (callback: (url: string) => void) => {
    setMediaCallback(() => callback);
    setMediaOpen(true);
  };

  const set = (name: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  function build(): Record<string, unknown> | null {
    const payload: Record<string, unknown> = {};
    const nextErrors: Record<string, string> = {};

    for (const f of fields) {
      const raw = values[f.name];

      if (f.type === 'boolean') {
        payload[f.name] = Boolean(raw);
        continue;
      }

      const str = typeof raw === 'string' ? raw.trim() : '';
      if (str === '') {
        if (f.required) nextErrors[f.name] = `${f.label} is required`;
        continue; // omit empty optional fields so the API keeps defaults
      }

      switch (f.type) {
        case 'number': {
          const n = Number(str);
          if (Number.isNaN(n)) nextErrors[f.name] = `${f.label} must be a number`;
          else payload[f.name] = n;
          break;
        }
        case 'tags':
          payload[f.name] = str.split(',').map((t) => t.trim()).filter(Boolean);
          break;
        case 'json':
          try {
            payload[f.name] = JSON.parse(str);
          } catch {
            nextErrors[f.name] = `${f.label} must be valid JSON`;
          }
          break;
        default:
          payload[f.name] = str;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 ? payload : null;
  }

  const visible = fields.filter((f) => !f.hidden);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload = build();
        if (payload) onSubmit(payload);
      }}
      className="flex flex-col gap-3.5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
        {visible.map((f) => (
          <div key={f.name} className={f.full || f.type === 'boolean' ? 'sm:col-span-2' : ''}>
            {f.type === 'boolean' ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3.5 py-2.5">
                <div>
                  <Label className="text-xs font-semibold">{f.label}</Label>
                  {f.help && <p className="text-[11px] text-muted-foreground mt-0.5">{f.help}</p>}
                </div>
                <Switch
                  checked={Boolean(values[f.name])}
                  onCheckedChange={(c) => set(f.name, c)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Label htmlFor={f.name} className="text-xs font-semibold text-foreground/90">
                  {f.label}
                  {f.required && <span className="text-primary ml-0.5">*</span>}
                </Label>

                {f.type === 'richtext' ? (
                  <RichTextEditor
                    value={String(values[f.name] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(html) => set(f.name, html)}
                    onOpenMediaLibrary={triggerMediaLibrary}
                  />
                ) : f.type === 'textarea' || f.type === 'json' ? (
                  <Textarea
                    id={f.name}
                    value={String(values[f.name] ?? '')}
                    placeholder={f.placeholder}
                    rows={f.type === 'json' ? 4 : 3}
                    className={`text-xs p-2.5 rounded-xl border-zinc-300 dark:border-zinc-700 ${f.type === 'json' ? 'font-mono text-xs' : ''}`}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                ) : f.type === 'select' ? (
                  <Select
                    value={String(values[f.name] ?? '')}
                    onValueChange={(v) => set(f.name, v)}
                  >
                    <SelectTrigger id={f.name} className="h-9 text-xs px-3 rounded-xl border-zinc-300 dark:border-zinc-700">
                      <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs py-1.5">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === 'image' || f.name.toLowerCase().includes('image') || f.name.toLowerCase().includes('video') || f.name.toLowerCase().includes('photo') || f.name.toLowerCase().includes('media') ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                      <Input
                        id={f.name}
                        type="text"
                        value={String(values[f.name] ?? '')}
                        placeholder="Choose file or enter URL..."
                        onChange={(e) => set(f.name, e.target.value)}
                        className="flex-1 h-9 text-xs px-3 rounded-xl"
                      />
                      <label className="cursor-pointer bg-brand hover:bg-brand/90 text-white font-bold text-xs px-3 py-2 rounded-xl inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-all">
                        {uploadingField === f.name ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,video/*,.mp4,.mov,.webm,.jpg,.png,.jpeg,.gif"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingField(f.name);
                            try {
                              let uploadedUrl: string | null = null;
                              const folder = file.type.startsWith('video/') ? 'video' : 'gallery';

                              try {
                                uploadedUrl = await uploadToSupabase({
                                  file,
                                  bucket: 'mp-public',
                                  folder,
                                });
                              } catch (subaErr) {
                                try {
                                  uploadedUrl = await uploadToSupabase({
                                    file,
                                    bucket: 'mp-cms',
                                    folder,
                                  });
                                } catch (subaErr2) {
                                  console.warn('Supabase direct upload notice:', subaErr2);
                                }
                              }

                              if (!uploadedUrl) {
                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  const res = await fetch('/api/cms/media', { method: 'POST', body: formData });
                                  const data = await res.json().catch(() => ({}));
                                  uploadedUrl = data?.data?.url || data?.url || data?.mediaUrl || data?.data?.mediaUrl || null;
                                } catch (apiErr) {
                                  console.warn('API media upload error:', apiErr);
                                }
                              }

                              if (uploadedUrl) {
                                set(f.name, uploadedUrl);
                                toast.success(`🎉 ${file.name} uploaded successfully!`);
                              } else {
                                const localUrl = URL.createObjectURL(file);
                                set(f.name, localUrl);
                                toast.success(`🎉 ${file.name} loaded locally! Click Save to confirm.`);
                              }
                            } catch (err: any) {
                              toast.error(`❌ Upload error: ${err?.message || 'Failed to upload'}`);
                            } finally {
                              setUploadingField(null);
                            }
                          }}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerMediaLibrary((url) => set(f.name, url))}
                        className="shrink-0 rounded-xl h-9 text-xs px-2.5"
                      >
                        Media Library
                      </Button>
                    </div>
                    {values[f.name] && (
                      <div className="p-2 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5">
                        {String(values[f.name]).match(/\.(mp4|mov|webm)$/i) || f.name.toLowerCase().includes('video') ? (
                          <div className="h-12 w-16 rounded-md bg-black flex items-center justify-center text-white shrink-0 overflow-hidden relative border border-border">
                            <video src={String(values[f.name])} className="h-full w-full object-cover" />
                            <Film className="w-4 h-4 absolute inset-0 m-auto text-white/80 pointer-events-none" />
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={String(values[f.name])} alt="Preview" className="h-12 w-16 object-cover rounded-md shrink-0 border border-border" />
                        )}
                        <div className="text-[11px] text-muted-foreground truncate font-mono flex-1">{String(values[f.name])}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={String(values[f.name] ?? '')}
                    placeholder={f.placeholder}
                    className="h-9 text-xs px-3 rounded-xl border-zinc-300 dark:border-zinc-700"
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}

                {f.help && f.type !== 'json' && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{f.help}</p>
                )}
                {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-3 w-full">
        {config.key === 'blog' && initial && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mr-auto text-xs text-primary hover:text-primary/90 rounded-xl"
            disabled={submitting}
            onClick={() => {
              const payload = build();
              if (payload) {
                onSubmit(payload);
                const slug = String(payload.slug || initial.slug);
                const token = String(initial.previewToken || '');
                window.open(`/blog/${slug}?preview=${token}`, '_blank');
              }
            }}
          >
            Preview Draft
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting} className="text-xs rounded-xl">
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting} className="text-xs rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white">
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <MediaLibrary
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={(url) => {
          if (mediaCallback) mediaCallback(url);
          setMediaOpen(false);
        }}
      />
    </form>
  );
}
