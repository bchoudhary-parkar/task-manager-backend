import { Router, Request, Response } from 'express';
import { authorize } from '../middleware/auth_middleware.js';
import { 
  getPermissions, 
  createRole, 
  getRoles, 
  getRoleById,
  updateRole,
  deleteRole
} from '../controllers/roleController.js';

const router = Router();

router.get('/permissions', authorize, getPermissions);
router.post('/roles', authorize, createRole);
router.get('/roles', authorize, getRoles);
router.get('/roles/:id', authorize, getRoleById);
router.put('/roles/:id', authorize, updateRole);
router.delete('/roles/:id', authorize, deleteRole);


export default router;