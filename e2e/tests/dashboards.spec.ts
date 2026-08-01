import { test, expect, describeAsRole } from '../support/fixtures';
import { DashboardPage } from '../pages/DashboardPage';

// EMPLOYEE dashboard — all spec'd tabs must render without runtime errors.
describeAsRole('EMPLOYEE', 'Employee dashboard', () => {
  const tabs = ['overview', 'tasks', 'projects', 'schedule', 'notifications', 'documents', 'profile', 'settings'];

  test('overview loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/employee/dashboard');
    await dash.expectHeading(/welcome/i);
    await dash.expectNoRuntimeError();
  });

  for (const tab of tabs) {
    test(`tab: ${tab} renders`, async ({ page }) => {
      const dash = new DashboardPage(page);
      await dash.openTab('/employee/dashboard', tab);
      await dash.expectNoRuntimeError();
    });
  }
});

// PROJECT_MANAGER dashboard.
describeAsRole('PROJECT_MANAGER', 'Project Manager dashboard', () => {
  const tabs = ['overview', 'projects', 'tasks', 'team', 'talent', 'requests', 'deliverables', 'calendar', 'reports', 'notifications', 'profile', 'settings'];

  test('overview loads with project KPIs', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/project-manager/dashboard');
    await dash.expectHeading(/welcome/i);
    await dash.expectNoRuntimeError();
  });

  for (const tab of tabs) {
    test(`tab: ${tab} renders`, async ({ page }) => {
      const dash = new DashboardPage(page);
      await dash.openTab('/project-manager/dashboard', tab);
      await dash.expectNoRuntimeError();
    });
  }
});

describeAsRole('TALENT', 'Talent dashboard', () => {
  test('loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/talent-dashboard');
    await dash.expectNoRuntimeError();
  });
});

describeAsRole('CLIENT', 'Client portal', () => {
  test('loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/client-portal');
    await dash.expectNoRuntimeError();
  });
});

describeAsRole('EDITOR', 'Editor portal', () => {
  test('loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/editor-portal');
    await dash.expectNoRuntimeError();
    await expect(page.getByRole('heading', { name: /editor portal/i })).toBeVisible();
  });
});

describeAsRole('ADMIN', 'Admin dashboard', () => {
  test('loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/admin');
    await dash.expectNoRuntimeError();
  });
});

describeAsRole('SUPER_ADMIN', 'Super Admin dashboard', () => {
  test('loads', async ({ page }) => {
    const dash = new DashboardPage(page);
    await dash.open('/super-admin');
    await dash.expectNoRuntimeError();
  });
});
