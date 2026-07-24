export const dynamic = 'force-dynamic';

import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function ReferralsCmsPage() {
  return <ResourceManager config={RESOURCES.referrals} />;
}
