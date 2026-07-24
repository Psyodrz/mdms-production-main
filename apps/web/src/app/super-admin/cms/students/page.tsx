'use client';

import React from 'react';
import CmsShell from '../_components/CmsShell';
import { StudentManagementClient } from '@/components/admin/StudentManagementClient';

export default function SuperAdminStudentsPage() {
  return (
    <CmsShell>
      <StudentManagementClient />
    </CmsShell>
  );
}
