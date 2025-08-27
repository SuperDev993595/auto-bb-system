import { useAuth } from '../context/AuthContext';

export interface RolePermissions {
  canViewApprovals: boolean;
  canApproveAppointments: boolean;
  canDeclineAppointments: boolean;
  canAssignFollowUpTasks: boolean;
  canViewFollowUpTasks: boolean;
  canManageSystem: boolean;
}

export const useRoleAccess = (): RolePermissions => {
  const { user } = useAuth();
  const userRole = user?.role || '';

  const permissions: RolePermissions = {
    canViewApprovals: ['super_admin', 'admin'].includes(userRole),
    canApproveAppointments: ['super_admin', 'admin'].includes(userRole),
    canDeclineAppointments: ['super_admin', 'admin'].includes(userRole),
    canAssignFollowUpTasks: ['super_admin', 'admin'].includes(userRole),
    canViewFollowUpTasks: ['super_admin', 'admin', 'sub_admin'].includes(userRole),
    canManageSystem: ['super_admin'].includes(userRole),
  };

  return permissions;
};

export default useRoleAccess;
