import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function TeamCmsPage() {
  return <ResourceManager config={RESOURCES.team} />;
}
