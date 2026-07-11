import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function FaqCmsPage() {
  return <ResourceManager config={RESOURCES.faq} />;
}
