import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function BlogCmsPage() {
  return <ResourceManager config={RESOURCES.blog} />;
}
