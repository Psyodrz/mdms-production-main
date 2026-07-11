import { ResourceManager } from '../_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function PortfolioCmsPage() {
  return <ResourceManager config={RESOURCES.portfolio} />;
}
