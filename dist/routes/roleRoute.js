import { Router } from 'express';
import { authorizeRoleManagement } from '../middleware/auth_middleware.js';
import { getPermissions, createRole, getRoles, getRoleById, updateRole, deleteRole } from '../controllers/roleController.js';
const router = Router();
router.get('/permissions', authorizeRoleManagement, getPermissions);
router.post('/roles', authorizeRoleManagement, createRole);
router.get('/roles', authorizeRoleManagement, getRoles);
router.get('/roles/:id', authorizeRoleManagement, getRoleById);
router.put('/roles/:id', authorizeRoleManagement, updateRole);
router.delete('/roles/:id', authorizeRoleManagement, deleteRole);
export default router;
//# sourceMappingURL=roleRoute.js.map