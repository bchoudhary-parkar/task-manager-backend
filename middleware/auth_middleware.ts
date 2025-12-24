import { Request, Response, NextFunction } from 'express';
import { permissionsMap } from '../constants/permissions.js';
 
// Adding status check to authorization middlewares so as it will logout automatically
export const authorizeRoleManagement = (req: Request, res: Response, next: NextFunction) => {
  const userPermissions = req.user?.permissions || [];
  const userStatus = (req.user as any)?.status;
 
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
 
export const authorizeUserManagement = (req: Request, res: Response, next: NextFunction) => {
  const userPermissions = req.user?.permissions || [];
  const userStatus = (req.user as any)?.status;
 
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
 
export const authorizeTaskManagement = (req: Request, res: Response, next: NextFunction) => {
  const taskPermissions = req.user?.permissions || [];
  const userStatus = (req.user as any)?.status;
 
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
 