import { Request, Response, NextFunction } from 'express';
import { permissionsMap } from '../constants/permissions.js';

// No need for custom interface anymore - use extended Request from express.d.ts
export const authorizeRoleManagement = (req: Request, res: Response, next: NextFunction) => {
  const userPermissions = req.user?.permissions || [];
  
  if (!userPermissions.includes(permissionsMap.role_management)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  
  next();
};

export const authorizeUserManagement = (req: Request, res: Response, next: NextFunction) => {
  const userPermissions = req.user?.permissions || [];
  
  if (!userPermissions.includes(permissionsMap.user_management)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions for user management' });
  }
  
  next();
};
export const authorizeTaskManagement = (req: Request, res: Response, next: NextFunction) => {
  const taskPermissions = req.user?.permissions || [];
 
  if (!taskPermissions.includes(permissionsMap.task_management)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions for task management' });
  }
 
  next();
};