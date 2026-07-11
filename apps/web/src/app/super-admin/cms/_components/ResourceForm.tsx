'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldDef, ResourceConfig } from '@/lib/cms/resources';

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
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {visible.map((f) => (
          <div key={f.name} className={f.full || f.type === 'boolean' ? 'sm:col-span-2' : ''}>
            {f.type === 'boolean' ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
                <div>
                  <Label>{f.label}</Label>
                  {f.help && <p className="text-xs text-muted-foreground mt-0.5">{f.help}</p>}
                </div>
                <Switch
                  checked={Boolean(values[f.name])}
                  onCheckedChange={(c) => set(f.name, c)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={f.name}>
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
                    rows={f.type === 'json' ? 5 : 4}
                    className={f.type === 'json' ? 'font-mono text-xs' : ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                ) : f.type === 'select' ? (
                  <Select
                    value={String(values[f.name] ?? '')}
                    onValueChange={(v) => set(f.name, v)}
                  >
                    <SelectTrigger id={f.name}>
                      <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={String(values[f.name] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}

                {f.help && f.type !== 'json' && (
                  <p className="text-xs text-muted-foreground">{f.help}</p>
                )}
                {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border pt-4 w-full">
        {config.key === 'blog' && initial && (
          <Button
            type="button"
            variant="outline"
            className="mr-auto text-primary hover:text-primary/90"
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
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
