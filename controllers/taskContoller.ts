import { Request, Response } from 'express';
import Task, { ITask } from '../models/task.js';
import User from '../models/User.js';
import { QueryFilter, Document } from 'mongoose';
 
// Get all tasks with optional filters
interface ITaskDocument extends ITask, Document {}
 
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, assignedTo, status, priority } = req.query as {
      search?: string;
      assignedTo?: string;
      status?: string;
      priority?: string;
    };
 
    let query: QueryFilter<ITaskDocument> = {};
   
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
   
    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
   
    // Filter by status
    if (status) {
      query.status = status;
    }
   
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }
 
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email picture status')
      .sort({ createdAt: -1 });
 
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any)  {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};
 
// Get single task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email picture status');
 
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }
 
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message,
    });
  }
};
 
// Create new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
 
    // Validate required fields
    if (!title) {
      res.status(400).json({
        success: false,
        message: 'Title is required',
      });
      return;
    }
 
    // Validate assignedTo user exists if provided
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        res.status(400).json({
          success: false,
          message: 'Assigned user not found',
        });
        return;
      }
    }
 
    // Create task with createdBy field
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user?.id, 
    });
   
    // Populate assignedTo before returning
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email picture status');
 
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};
 
// Update task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate assignedTo user exists if provided
    if (req.body.assignedTo) {
      const userExists = await User.findById(req.body.assignedTo);
      if (!userExists) {
        res.status(400).json({
          success: false,
          message: 'Assigned user not found',
        });
        return;
      }
    }
 
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('assignedTo', 'name email picture status');
 
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }
 
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};
 
// Delete task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
 
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }
 
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};
 
// Bulk update task status (for drag and drop)
export const bulkUpdateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { id, status }
 
    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty',
      });
      return;
    }
 
    const promises = updates.map((update: any) =>
      Task.findByIdAndUpdate(
        update.id,
        { status: update.status },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email picture status')
    );
 
    const tasks = await Promise.all(promises);
 
    res.status(200).json({
      success: true,
      message: 'Tasks updated successfully',
      data: tasks,
    });
  } catch (error: any) {
    console.error('Error bulk updating tasks:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating tasks',
      error: error.message,
    });
  }
};
 
// Get users for task assignment (paginated, only available users)
export const getUsersForTaskAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
   
    const skip = (page - 1) * limit;
   
    // Build query - only show available users
    const query: any = {
      status: 'available'
    };
   
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
 
    // Get total count
    const totalUsers = await User.countDocuments(query);
   
    // Get users with pagination
    const users = await User.find(query)
      .select('name email picture status role')
      .populate('role', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .lean();
 
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching users for task assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users for task assignment',
      error: error.message,
    });
  }
};
 