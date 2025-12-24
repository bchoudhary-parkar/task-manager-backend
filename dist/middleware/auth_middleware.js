import { permissionsMap } from '../constants/permissions.js';
// Adding status check to authorization middlewares so as it will logout automatically
export const authorizeRoleManagement = (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const userStatus = req.user?.status;
    if (userStatus === 'not available') {
        return res.status(403).json({
            message: 'Your account has been deactivated',
            code: 'ACCOUNT_INACTIVE'
        });
    }
    if (!userPermissions.includes(permissionsMap.role_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
};
export const authorizeUserManagement = (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const userStatus = req.user?.status;
    if (userStatus === 'not available') {
        return res.status(403).json({
            message: 'Your account has been deactivated',
            code: 'ACCOUNT_INACTIVE'
        });
    }
    if (!userPermissions.includes(permissionsMap.user_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions for user management' });
    }
    next();
};
export const authorizeTaskManagement = (req, res, next) => {
    const taskPermissions = req.user?.permissions || [];
    const userStatus = req.user?.status;
    if (userStatus === 'not available') {
        return res.status(403).json({
            message: 'Your account has been deactivated',
            code: 'ACCOUNT_INACTIVE'
        });
    }
    if (!taskPermissions.includes(permissionsMap.task_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions for task management' });
    }
    next();
};
//# sourceMappingURL=auth_middleware.js.map