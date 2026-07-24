export const dynamic = 'force-dynamic';

import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function SalesTargetsCmsPage() {
  return <ResourceManager config={RESOURCES.salesTargets} />;
}
