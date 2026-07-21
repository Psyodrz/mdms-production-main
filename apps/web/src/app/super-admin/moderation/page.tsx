import { TalentModerationClient } from '@/components/admin/TalentModerationClient';
import { serverFetchAPI } from '@/lib/server-api-client';

async function getPendingProfiles() {
  try {
    const json = await serverFetchAPI('/talent/pending', { cache: 'no-store' });
    const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function SuperAdminModerationPage() {
  const pendingProfiles = await getPendingProfiles();

  return (
    <div className="py-6">
      <TalentModerationClient initialProfiles={pendingProfiles} />
    </div>
  );
}
