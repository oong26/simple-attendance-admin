import { usePage } from "@inertiajs/react";

export function usePermission() {
    const user = usePage().props.auth?.user;

    const perms: string[] = user?.permissions || [];
    const roles: string[] = user?.roles || [];

    return {
        // Check permission
        can: (permission: string, userPermissions: string[]|null): boolean => {
            if (userPermissions) {
                return userPermissions.includes(permission);
            }
            return perms.includes(permission);
        },

        // Check any permission
        canAny: (permissionList: string[]): boolean => {
            return permissionList.some(p => perms.includes(p));
        },

        // Check role
        hasRole: (role: string): boolean => {
            return roles.includes(role);
        },

        // Check if user is superadmin
        isSuperadmin: (): boolean => {
            return roles.includes("superadmin");
        }
    };
}
