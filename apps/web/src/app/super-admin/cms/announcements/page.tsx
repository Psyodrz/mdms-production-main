import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function AnnouncementsCmsPage() {
  return <ResourceManager config={RESOURCES.announcements} />;
}
