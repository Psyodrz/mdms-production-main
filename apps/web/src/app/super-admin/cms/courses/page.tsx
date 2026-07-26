import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function CoursesCmsPage() {
  return <ResourceManager config={RESOURCES.courses} />;
}
