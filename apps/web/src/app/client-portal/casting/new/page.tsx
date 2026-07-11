'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { fetchAPI } from '@/lib/api-client';

export default function CreateCastingCall() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    projectType: 'Brand Shoot',
    location: '',
    description: '',
    compensationDetails: '',
    deadline: '',
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please add a project title and description.');
      return;
    }
    setSubmitting(true);
    try {
      await fetchAPI('/bookings/casting-calls', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          projectType: form.projectType,
          description: form.description,
          location: form.location || undefined,
          compensationDetails: form.compensationDetails || undefined,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        }),
      });
      toast.success('Casting call published to the talent roster.');
      router.push('/client-portal/casting');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish casting call.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PortalNavbar />

      <main className="page-content">
        <div className="max-w-3xl mx-auto">

          <Reveal direction="up">
            <div className="mb-8 border-b border-[var(--color-border)] pb-8">
              <Button href="/client-portal/casting" variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground -ml-4">
                &larr; Back to Casting Board
              </Button>
              <h1 className="text-4xl font-serif text-foreground">
                Create Casting Call
              </h1>
              <p className="text-muted-foreground mt-2">Publish a new opportunity to our talent roster.</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-8 bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Project Title</label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} type="text" placeholder="e.g. Summer Fashion Campaign" className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Project Type</label>
                    <select value={form.projectType} onChange={(e) => set('projectType', e.target.value)} className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground">
                      <option>Brand Shoot</option>
                      <option>Commercial Video</option>
                      <option>Feature Film</option>
                      <option>Runway Show</option>
                      <option>Social Media Campaign</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Location</label>
                    <input value={form.location} onChange={(e) => set('location', e.target.value)} type="text" placeholder="e.g. Mumbai, India" className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Description & Requirements</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="Describe the project and what kind of talent you are looking for..." className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground resize-y" required></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Compensation</label>
                    <input value={form.compensationDetails} onChange={(e) => set('compensationDetails', e.target.value)} type="text" placeholder="e.g. Paid, TFP" className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Application Deadline</label>
                    <input
                      value={form.deadline}
                      onChange={(e) => set('deadline', e.target.value)}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] transition-colors text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--color-border)] flex justify-end gap-4">
                <Button href="/client-portal/casting" variant="outline" type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish Casting Call'}
                </Button>
              </div>
            </form>
          </Reveal>

        </div>
      </main>
    </>
  );
}
