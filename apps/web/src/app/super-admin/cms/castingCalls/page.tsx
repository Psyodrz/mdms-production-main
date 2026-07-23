import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function CastingCallsCmsPage() {
  return <ResourceManager config={RESOURCES.castingCalls} />;
}
