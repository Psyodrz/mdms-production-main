export const dynamic = 'force-dynamic';

import React from 'react';
import { notFound } from 'next/navigation';
import { getResource } from '@/lib/cms/resources';
import { ResourceManager } from '../_components/ResourceManager';

type Ctx = { params: Promise<{ resource: string }> };

export default async function DynamicCmsResourcePage(ctx: Ctx) {
  const { resource } = await ctx.params;
  const config = getResource(resource);

  if (!config) {
    notFound();
  }

  return <ResourceManager config={config} />;
}
