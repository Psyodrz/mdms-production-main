import { redirect } from 'next/navigation';

// Safety redirect: some legacy flows push to /dashboard. Send users to the
// client portal (role-specific dashboards live at /admin, /super-admin,
// /talent-dashboard, /editor-portal and are routed by the login handler).
export default function DashboardRedirect() {
  redirect('/client-portal');
}
