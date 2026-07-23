import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function CastingCallsKebabCmsPage() {
  return <ResourceManager config={RESOURCES.castingCalls} />;
}
