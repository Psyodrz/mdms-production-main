'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api-client';

export function BookingForm({ talentProfileId }: { talentProfileId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      requesterName: formData.get('requesterName'),
      requesterEmail: formData.get('requesterEmail'),
      requesterPhone: formData.get('requesterPhone'),
      projectType: formData.get('projectType'),
      dateNeeded: formData.get('dateNeeded') || undefined,
      city: formData.get('city'),
      budgetRange: formData.get('budgetRange'),
      briefDescription: formData.get('briefDescription'),
    };

    try {
      await fetchAPI(`/talent/${talentProfileId}/hire`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl font-serif text-foreground mb-4">Inquiry Received</h2>
        <p className="text-muted-foreground font-light mb-8">
          Thank you. Our team will review your project details and get back to you shortly.
        </p>
        <button 
          onClick={() => window.location.href = '/talent/directory'}
          className="px-8 py-4 border border-[var(--color-border)] text-foreground text-sm tracking-widest uppercase hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground border-b border-[var(--color-border)] pb-2">Your Contact Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Full Name *</label>
            <input 
              type="text" 
              name="requesterName" 
              required 
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Phone Number *</label>
            <input 
              type="tel" 
              name="requesterPhone" 
              required 
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-widest uppercase text-muted-foreground">Email Address *</label>
          <input 
            type="email" 
            name="requesterEmail" 
            required 
            className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground border-b border-[var(--color-border)] pb-2">Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Project Type *</label>
            <input 
              type="text" 
              name="projectType" 
              placeholder="e.g., Commercial Shoot, Fashion Campaign"
              required 
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Location / City</label>
            <input 
              type="text" 
              name="city" 
              placeholder="e.g., Studio 4, Mumbai or Remote"
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Date Needed</label>
            <input 
              type="date" 
              name="dateNeeded" 
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase text-muted-foreground">Estimated Budget</label>
            <input 
              type="text" 
              name="budgetRange" 
              placeholder="e.g., $1000 - $2000"
              className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-widest uppercase text-muted-foreground">Brief Description *</label>
          <textarea 
            name="briefDescription" 
            rows={5}
            required
            placeholder="Describe your project, usage rights required, and any specific requests..."
            className="w-full bg-transparent border-b border-[var(--color-border)] py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
          ></textarea>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-[var(--color-primary)] text-[var(--color-base)] uppercase tracking-widest text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}

