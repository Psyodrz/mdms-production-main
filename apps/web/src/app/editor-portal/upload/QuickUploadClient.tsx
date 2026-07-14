'use client';

import React, { useState } from 'react';
import { UploadVersionUI } from '@/components/ui/UploadVersionUI';
import { Card } from '@/components/ui/Card';

interface Project {
  id: string;
  name: string;
  client?: {
    user?: {
      companyName?: string;
    };
  };
  status: string;
  versions?: Array<{
    versionNumber: number;
  }>;
}

export function QuickUploadClient({
  projects,
  accessToken,
}: {
  projects: Project[];
  accessToken: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const latestVersionNumber = selectedProject?.versions?.[0]?.versionNumber || 0;
  const nextVersionNumber = latestVersionNumber + 1;

  return (
    <div className="space-y-6">
      <Card padding="lg" className="bg-surface border-border">
        <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Select Project
        </label>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No projects available for upload.
          </p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-background border border-border px-4 py-3 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="" disabled>-- Select project to upload to --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.client?.user?.companyName ? `(${p.client.user.companyName})` : ''}
              </option>
            ))}
          </select>
        )}
      </Card>

      {selectedProjectId && selectedProject && (
        <div className="animate-fadeIn">
          <UploadVersionUI
            projectId={selectedProjectId}
            accessToken={accessToken}
            nextVersionNumber={nextVersionNumber}
          />
        </div>
      )}
    </div>
  );
}
