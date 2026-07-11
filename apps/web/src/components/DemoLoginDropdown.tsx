'use client';

import React from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

interface DemoLoginDropdownProps {
  onSelect: (email: string, pass: string) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Super Admin (God Mode)', email: 'superadmin@mpproduction.com', pass: 'Admin@123', role: 'super_admin' },
  { label: 'Admin (Studio Manager)', email: 'admin@mpproduction.com', pass: 'Admin@123', role: 'admin' },
  { label: 'Client (Brand / Agency)', email: 'client@example.com', pass: 'Admin@123', role: 'client' },
  { label: 'Talent (Model / Actor)', email: 'talent@example.com', pass: 'Admin@123', role: 'talent' },
];

export function DemoLoginDropdown({ onSelect }: DemoLoginDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    if (!email) return;
    const acc = DEMO_ACCOUNTS.find((a) => a.email === email);
    if (acc) {
      onSelect(acc.email, acc.pass);
    }
  };

  return (
    <div className="w-full mb-6 p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
        <Sparkles className="w-4 h-4 text-brand animate-pulse" />
        <span>Quick Demo Login:</span>
      </div>
      <div className="relative w-full sm:w-auto min-w-[240px]">
        <select
          onChange={handleChange}
          defaultValue=""
          className="w-full appearance-none bg-background text-foreground text-xs sm:text-sm px-4 py-2.5 pr-10 rounded-lg border border-border focus:outline-none focus:border-[#e11d48] transition-colors cursor-pointer font-sans"
        >
          <option value="" disabled className="text-muted-foreground">
            Select a test role...
          </option>
          {DEMO_ACCOUNTS.map((acc) => (
            <option key={acc.email} value={acc.email} className="bg-background text-foreground py-1">
              {acc.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
