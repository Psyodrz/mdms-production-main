import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';



import { serverFetchAPI } from '@/lib/server-api-client';

async function getPendingProfiles() {
  try {
    // Authenticated call — pending talent queue requires ADMIN/SUPER_ADMIN.
    const json = await serverFetchAPI('/talent/pending', { cache: 'no-store' });
    const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
    return Array.isArray(list) && list.length > 0 ? list : [];
  } catch (error) {
    return [];
  }
}

export default async function ContentModeration() {
  const pendingProfiles = await getPendingProfiles();

  return (
    <>
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-(--color-border) pb-8">
              <span className="text-(--color-primary) tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                Internal Operations
              </span>
              <h1 className="text-4xl font-serif text-foreground">
                Talent Moderation
              </h1>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="bg-(--color-surface) border border-(--color-border) p-6">
              <h2 className="text-xl font-serif text-foreground mb-6">Pending Approvals ({pendingProfiles.length})</h2>
              
              <div className="space-y-4">
                {pendingProfiles.length === 0 ? (
                  <p className="text-muted-foreground">No profiles currently pending review.</p>
                ) : (
                  pendingProfiles.map((profile: any) => (
                    <div key={profile.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-(--color-base) border border-(--color-border)">
                      <div>
                        <p className="text-foreground font-medium text-lg">
                          {profile.user?.firstName} {profile.user?.lastName}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Types: {profile.talentTypes?.join(', ')} | City: {profile.city}
                        </p>
                        <p className="text-muted-foreground text-sm mt-2 max-w-2xl line-clamp-2">
                          {profile.bio}
                        </p>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex gap-3">
                        <button className="px-4 py-2 border border-(--color-border) hover:border-(--color-text-main) transition-colors text-sm uppercase tracking-widest font-semibold">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-primary text-white hover:bg-(--color-primary-hover) transition-colors text-sm uppercase tracking-widest font-semibold">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors border border-red-900/50 text-sm uppercase tracking-widest font-semibold">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}

