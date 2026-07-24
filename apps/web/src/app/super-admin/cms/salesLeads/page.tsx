export const dynamic = 'force-dynamic';

import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function SalesLeadsCmsPage() {
  return <ResourceManager config={RESOURCES.salesLeads} />;
}
