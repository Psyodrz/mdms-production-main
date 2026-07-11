import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function NewsletterCmsPage() {
  return <ResourceManager config={RESOURCES.newsletter} />;
}
