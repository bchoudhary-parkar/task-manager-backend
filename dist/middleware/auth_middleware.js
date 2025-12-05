import { permissionsMap } from '../constants/permissions.js';
export const authorize = (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    if (!userPermissions.includes(permissionsMap.role_management)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
};
//# sourceMappingURL=auth_middleware.js.map