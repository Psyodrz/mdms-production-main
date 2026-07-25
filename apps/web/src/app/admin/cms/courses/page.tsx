'use client';

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Container } from '@/components/ui/Container';
import { ResourceManager } from '../../../super-admin/cms/_components/ResourceManager';
import { RESOURCES } from '@/lib/cms/resources';

export default function AdminCoursesCmsPage() {
  return (
    <>
      <PortalNavbar />
      <main className="page-content pt-16 pb-24 bg-background text-foreground min-h-screen">
        <Container>
          <div className="mb-8 border-b border-border pb-6">
            <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
              CMS Administration
            </span>
            <h1 className="text-3xl font-serif text-foreground">Creator Courses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage Creator Academy masterclasses shown on the public storefront.
            </p>
          </div>
          <ResourceManager config={RESOURCES.courses} />
        </Container>
      </main>
    </>
  );
}
