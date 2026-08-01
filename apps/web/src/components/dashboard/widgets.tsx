'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

/**
 * Reusable dashboard widgets shared across role dashboards (Employee, Project
 * Manager, …). Keeps the role dashboards DRY and visually consistent with the
 * existing portal styling (surface cards, brand accents).
 */

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon ? <span className="text-brand">{icon}</span> : null}
      </div>
      <p className="text-2xl font-bold font-serif text-foreground">{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground mt-2">{hint}</p> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-serif text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <span className="text-muted-foreground">{icon || <Inbox className="size-10" />}</span>
      <p className="text-foreground font-medium">{title}</p>
      {description ? <p className="text-sm text-muted-foreground max-w-md">{description}</p> : null}
    </div>
  );
}

export function DashboardTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto mb-8">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
              isActive
                ? 'bg-brand text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
