import { Role, Permission } from '@mdms/types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // all permissions
  [Role.ADMIN]: [
    Permission.MANAGE_BLOG,
    Permission.MANAGE_PORTFOLIO,
    Permission.MANAGE_TEAM,
    Permission.MANAGE_TESTIMONIALS,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [Role.PROJECT_MANAGER]: [],
  [Role.EDITOR]:   [],
  [Role.EMPLOYEE]: [],
  [Role.TALENT]:   [],
  [Role.CLIENT]:   [],
  [Role.GUEST]:    [],
};
