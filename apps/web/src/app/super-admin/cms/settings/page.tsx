'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { cms } from '@/lib/cms/client';
import { CONFIG_KEYS } from '@/lib/cms/resources';

function ConfigCard({ configKey, label, description }: { configKey: string; label: string; description: string }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let active = true;
    cms.getConfig(configKey).then((res) => {
      if (!active) return;
      const data = res.data;
      setValue(data == null ? '{\n  \n}' : JSON.stringify(data, null, 2));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [configKey]);

  async function save() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
      setInvalid(false);
    } catch {
      setInvalid(true);
      toast.error(`${label}: invalid JSON`);
      return;
    }
    setSaving(true);
    const res = await cms.setConfig(configKey, parsed, 'json');
    setSaving(false);
    if (res.ok) toast.success(`${label} saved`);
    else toast.error(res.error || `Failed to save ${label}`);
  }

  return (
    <div className="rounded-xl border border-border bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-medium text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button size="sm" onClick={save} disabled={loading || saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          className={`font-mono text-xs ${invalid ? 'border-destructive' : ''}`}
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Structured JSON configuration for global site sections. Each block is stored as a key in
          the backend SystemConfig store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CONFIG_KEYS.map((c) => (
          <ConfigCard key={c.key} configKey={c.key} label={c.label} description={c.description} />
        ))}
      </div>
    </div>
  );
}
