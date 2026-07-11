import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function ContactsCmsPage() {
  return <ResourceManager config={RESOURCES.contacts} />;
}
