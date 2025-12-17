import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole, getRoleById, getAllRoles } from '../controllers/roleController.js';
import { authorizeRoleManagement } from '../middleware/auth_middleware.js';
const router = Router();
// Specific routes first (no auth needed)
router.get('/all', getAllRoles);
router.get('/', authorizeRoleManagement, getRoles); // Move this BEFORE /:id
router.post('/', authorizeRoleManagement, createRole);
router.put('/:id', authorizeRoleManagement, updateRole);
router.delete('/:id', authorizeRoleManagement, deleteRole);
router.get('/:id', authorizeRoleManagement, getRoleById); // Move this to LAST
export default router;
//# sourceMappingURL=roleRoute.js.map