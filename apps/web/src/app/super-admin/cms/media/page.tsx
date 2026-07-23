import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function MediaCmsPage() {
  return <ResourceManager config={RESOURCES.media} />;
}
