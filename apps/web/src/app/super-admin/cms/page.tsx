import Link from 'next/link';
import {
  Clapperboard,
  Newspaper,
  Quote,
  Users,
  HelpCircle,
  Layers,
  Megaphone,
  UserCheck,
  Calendar,
  Folder,
  Sliders,
  Settings,
  Trash2,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { RESOURCES } from '@/lib/cms/resources';

const ICONS: Record<string, LucideIcon> = {
  Clapperboard,
  Newspaper,
  Quote,
  Users,
  HelpCircle,
  Layers,
  Megaphone,
  Mail,
  AtSign,
  UserCheck,
  Calendar,
  Folder,
  Sliders,
};

const SYSTEM = [
  {
    href: '/studio-8f2k/cms/settings',
    label: 'Site Settings',
    description: 'Hero, stats, pricing, navbar, footer and SEO configuration.',
    icon: Settings,
  },
  {
    href: '/studio-8f2k/cms/recycle-bin',
    label: 'Recycle Bin',
    description: 'Restore or permanently remove deleted content.',
    icon: Trash2,
  },
];

function Card({
  href,
  label,
  description,
  Icon,
}: {
  href: string;
  label: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
      </div>
      <div>
        <h3 className="font-medium text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

export default function CmsHubPage() {
  const resources = Object.values(RESOURCES);

  return (
    <div className="space-y-10">
      <header>
        <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold">
          CMS Administration
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Content Studio</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Create, edit, publish and organise every piece of content on the public site — from
          portfolio and blog to services, team and site-wide settings.
        </p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Content
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <Card
              key={r.key}
              href={`/studio-8f2k/cms/${r.key}`}
              label={r.labelPlural}
              description={r.description}
              Icon={ICONS[r.icon] ?? Layers}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          System
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYSTEM.map((s) => (
            <Card
              key={s.href}
              href={s.href}
              label={s.label}
              description={s.description}
              Icon={s.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
