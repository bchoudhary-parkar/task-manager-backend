import Task from '../models/task.js';
import User from '../models/User.js';
export const getTasks = async (req, res) => {
    try {
        const { search, assignedTo, status, priority } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (assignedTo) {
            query.assignedTo = { $regex: assignedTo, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email picture status')
            .populate('createdBy', 'name email picture status')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message,
        });
    }
};
export const getTaskById = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
            error: error.message,
        });
    }
};
// Create new task
export const createTask = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ success: false, message: 'Title is required' });
            return;
        }
        if (req.body.assignedTo) {
            const userExists = await User.findById(req.body.assignedTo);
            if (!userExists) {
                res.status(400).json({ success: false, message: 'Assigned user not found' });
                return;
            }
        }
        const task = await Task.create({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status || 'TODO',
            priority: req.body.priority || 'MEDIUM',
            assignedTo: req.body.assignedTo || null,
            createdBy: req.user?.id || 'Unknown',
            dueDate: req.body.dueDate,
            tags: req.body.tags || [],
            subtasks: req.body.subtasks || [],
        });
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email picture status')
            .lean();
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: populatedTask,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating task',
            error: error.message,
        });
    }
};
// Update task
export const updateTask = async (req, res) => {
    try {
        if (req.body.assignedTo && req.body.assignedTo !== null) {
            const userExists = await User.findById(req.body.assignedTo);
            if (!userExists) {
                res.status(400).json({
                    success: false,
                    message: 'Assigned user not found',
                });
                return;
            }
        }
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('assignedTo', 'name email picture status');
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
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating task',
            error: error.message,
        });
    }
};
// Delete task
export const deleteTask = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message,
        });
    }
};
// Bulk update task status (for drag and drop)
export const bulkUpdateStatus = async (req, res) => {
    try {
        const { updates } = req.body;
        if (!Array.isArray(updates) || updates.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Updates array is required and must not be empty',
            });
            return;
        }
        const promises = updates.map((update) => Task.findByIdAndUpdate(update.id, { status: update.status }, { new: true, runValidators: true }).populate('assignedTo', 'name email picture status'));
        const tasks = await Promise.all(promises);
        res.status(200).json({
            success: true,
            message: 'Tasks updated successfully',
            data: tasks,
        });
    }
    catch (error) {
        console.error('Error bulk updating tasks:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating tasks',
            error: error.message,
        });
    }
};
// Get users for task assignment 
export const getUsersForTaskAssignment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        // Build query - only show available users
        const query = {
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
    }
    catch (error) {
        console.error('Error fetching users for task assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users for task assignment',
            error: error.message,
        });
    }
};
//# sourceMappingURL=taskController.js.map