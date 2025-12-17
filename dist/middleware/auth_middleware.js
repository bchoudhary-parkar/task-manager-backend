import { permissionsMap } from '../constants/permissions.js';
// No need for custom interface anymore - use extended Request from express.d.ts
export const authorizeRoleManagement = (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    if (!userPermissions.includes(permissionsMap.role_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
};
export const authorizeUserManagement = (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    if (!userPermissions.includes(permissionsMap.user_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions for user management' });
    }
    next();
};
export const authorizeTaskManagement = (req, res, next) => {
    const taskPermissions = req.user?.permissions || [];
    if (!taskPermissions.includes(permissionsMap.task_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions for task management' });
    }
    next();
};
//# sourceMappingURL=auth_middleware.js.map