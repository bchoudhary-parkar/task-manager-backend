import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getUserById} from '../controllers/userController.js';
import { authorizeUserManagement } from '../middleware/auth_middleware.js';

const router = Router();

// All routes are protected by mock auth middleware in index.ts
router.post('/', authorizeUserManagement,createUser);
router.put('/:id', authorizeUserManagement, updateUser);
router.delete('/:id', authorizeUserManagement, deleteUser);
router.get('/', authorizeUserManagement, getUsers);
router.get('/:id', authorizeUserManagement, getUserById);
export default router;