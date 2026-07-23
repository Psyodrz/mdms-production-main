import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function FeatureFlagsCmsPage() {
  return <ResourceManager config={RESOURCES.featureFlags} />;
}
