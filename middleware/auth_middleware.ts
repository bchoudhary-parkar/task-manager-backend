import { Request, Response, NextFunction } from 'express';
import { permissionsMap } from '../constants/permissions.js';

interface AuthenticatedRequest extends Request {
  user?: {
    permissions: number[];
    roleId?: string;
    email?: string;
  };
}

export const authorize = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userPermissions = req.user?.permissions || [];
  if (!userPermissions.includes(permissionsMap.role_management)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  next();
};
