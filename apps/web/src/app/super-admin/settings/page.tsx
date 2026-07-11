import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';

const FALLBACK_FLAGS = [
  { key: 'NEW_BOOKING_ENGINE_V2', description: 'Enable multi-stage escrow checkout and automated invoice generation.', enabled: true },
  { key: 'VIRTUAL_STAGE_REALTIME_STATUS', description: 'Live IoT sensors telemetry feed on studio dashboard.', enabled: true },
  { key: 'AI_CASTING_MATCHMAKER', description: 'AI-assisted talent recommendations for client casting briefs.', enabled: false },
  { key: 'CLIENT_PORTAL_INSTANT_CHAT', description: 'Direct messaging channel between brand clients and studio producers.', enabled: true },
];

import { serverFetchAPI } from '@/lib/server-api-client';

async function getFeatureFlags() {
  try {
    const res = await serverFetchAPI('/system/flags', { next: { revalidate: 0 } });
    if (!res.success) return FALLBACK_FLAGS;
    return (res.data && res.data.length > 0) ? res.data : FALLBACK_FLAGS;
  } catch (error) {
    return FALLBACK_FLAGS;
  }
}

export default async function AdminSettings() {
  const flags = await getFeatureFlags();

  return (
    <>
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-(--color-border) pb-8 flex justify-between items-end">
              <div>
                <span className="text-(--color-primary) tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Configuration
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  System Settings
                </h1>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Feature Flags */}
              <div className="bg-(--color-surface) border border-(--color-border) p-6">
                <h2 className="text-xl font-serif text-foreground mb-6">Feature Flags</h2>
                
                <div className="space-y-4">
                  {flags.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No feature flags configured.</p>
                  ) : (
                    flags.map((flag: any) => (
                      <div key={flag.key} className="flex justify-between items-center p-4 border border-(--color-border)">
                        <div>
                          <p className="font-medium text-foreground">{flag.key}</p>
                          <p className="text-xs text-muted-foreground">{flag.description}</p>
                        </div>
                        <button className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors ${flag.enabled ? 'bg-primary text-white' : 'bg-transparent border border-(--color-border) text-muted-foreground'}`}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    ))
                  )}
                  
                  <button className="w-full py-3 mt-4 border border-dashed border-(--color-border) hover:border-(--color-text-main) text-sm tracking-widest uppercase transition-colors text-muted-foreground">
                    + Add Feature Flag
                  </button>
                </div>
              </div>

              {/* General Configs */}
              <div className="space-y-8">
                <div className="bg-(--color-surface) border border-(--color-border) p-6">
                  <h2 className="text-xl font-serif text-foreground mb-6">Business Hours</h2>
                  <p className="text-muted-foreground text-sm mb-4">Manage working days and operational hours for the booking engine.</p>
                  <button className="px-4 py-2 border border-(--color-border) hover:border-(--color-text-main) transition-colors text-sm uppercase tracking-widest font-semibold">
                    Edit Schedule
                  </button>
                </div>

                <div className="bg-(--color-surface) border border-(--color-border) p-6">
                  <h2 className="text-xl font-serif text-foreground mb-6">Blocked Dates</h2>
                  <p className="text-muted-foreground text-sm mb-4">Prevent bookings on specific calendar dates (holidays, maintenance).</p>
                  <button className="px-4 py-2 border border-(--color-border) hover:border-(--color-text-main) transition-colors text-sm uppercase tracking-widest font-semibold">
                    Manage Dates
                  </button>
                </div>
              </div>

            </div>
          </Reveal>

        </div>
      </main>
    </>
  );
}

