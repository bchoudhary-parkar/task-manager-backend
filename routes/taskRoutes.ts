import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateStatus,
  getUsersForTaskAssignment
} from '../controllers/taskContoller.js';
import { authorizeTaskManagement } from '../middleware/auth_middleware.js';
 
const taskRouter = express.Router();
 
// Task routes
taskRouter.get('/users', authorizeTaskManagement, getUsersForTaskAssignment);
taskRouter.get('/', authorizeTaskManagement, getTasks);
taskRouter.get('/:id', authorizeTaskManagement, getTaskById);
taskRouter.post('/', authorizeTaskManagement, createTask);
taskRouter.put('/:id', authorizeTaskManagement, updateTask);
taskRouter.delete('/:id', authorizeTaskManagement, deleteTask);
taskRouter.post('/bulk-update', authorizeTaskManagement, bulkUpdateStatus);
 
export default taskRouter;
 