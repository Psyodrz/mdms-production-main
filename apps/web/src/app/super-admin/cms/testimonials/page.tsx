import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function TestimonialsCmsPage() {
  return <ResourceManager config={RESOURCES.testimonials} />;
}
