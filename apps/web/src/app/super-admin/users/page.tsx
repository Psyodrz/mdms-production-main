import React, { Suspense } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { UserTable } from '@/components/admin/UserTable';

export default function UserDirectory() {
  return (
    <main className="page-content py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal direction="up">
          <div className="mb-8 border-b border-border pb-6 flex justify-between items-end">
            <div>
              <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                Access Management
              </span>
              <h1 className="text-4xl font-serif text-foreground">
                User Directory
              </h1>
            </div>
            <Button href="/studio-8f2k/users/invite" variant="outline" size="sm">
              Invite User
            </Button>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading user directory...</div>}>
            <UserTable currentUserRole="SUPER_ADMIN" />
          </Suspense>
        </Reveal>
      </div>
    </main>
  );
}
