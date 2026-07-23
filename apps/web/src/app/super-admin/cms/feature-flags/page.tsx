import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function FeatureFlagsKebabCmsPage() {
  return <ResourceManager config={RESOURCES.featureFlags} />;
}
