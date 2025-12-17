import { Request, Response } from 'express';
import { Role } from '../models/role.js';
import { permissionsMap, validatePermissions } from '../constants/permissions.js';

// GET /permissions
export const getPermissions = (req: Request, res: Response) => {
  return res.json(permissionsMap);
};

// GET /api/role/all - 
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    
    const roles = await Role.find()
      .select('_id name description permissions')
      .sort({ name: 1 })
      .lean();


    return res.json({
      success: true,
      data: roles
    });

  } catch (error: any) {
    console.error("Error fetching all roles:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch roles',
      error: error.message 
    });
  }
};

// POST /api/role - Create role
export const createRole = async (req: Request, res: Response) => {
  try {
    let { name, description, permissions } = req.body;
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and permissions are required' 
      });
    }

    name = name.trim();
    description = (description || '').trim();
    
    // Validate permission codes
    if (!validatePermissions(permissions)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid permission codes' 
      });
    }
    
    // Check if role already exists (case-insensitive)
    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingRole) {
      return res.status(409).json({ 
        success: false,
        message: 'Role already exists' 
      });
    }

    // Create role
    const newRole = await Role.create({ name, description, permissions });
    
    return res.status(201).json({
      success: true,
      data: newRole,
      message: 'Role created successfully'
    });
  } catch (error: any) {
    console.error('Create role error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// GET /api/role - Get all roles with pagination
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { 
      search = '', 
      page = '1', 
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [roles, total] = await Promise.all([
      Role.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Role.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      data: roles,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error: any) {
    console.error('Get roles error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// GET /api/role/:id - Get single role
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }

    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }
    
    return res.json({
      success: true,
      data: role
    });
  } catch (error: any) {
    console.error('Get role by ID error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// PUT /api/role/:id - Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, description, permissions } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }
    
    // Validate input
    if (!name && description === undefined && !permissions) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one field (name, description, or permissions) is required' 
      });
    }
    
    // Validate permissions if provided
    if (permissions && (!Array.isArray(permissions) || !validatePermissions(permissions))) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid permission codes' 
      });
    }
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }
    
    // Check for duplicate name if name is being updated
    if (name) {
      name = name.trim();
      
      // Only check for duplicates if the name actually changed
      if (name.toLowerCase() !== role.name.toLowerCase()) {
        const existingRole = await Role.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id }
        });
        
        if (existingRole) {
          return res.status(409).json({ 
            success: false,
            message: 'Role with this name already exists' 
          });
        }
      }
      
      role.name = name;
    }
    
    if (description !== undefined) {
      role.description = description.trim();
    }
    
    if (permissions) {
      role.permissions = permissions;
    }
    
    const updatedRole = await role.save();
    
    return res.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// DELETE /api/role/:id - Delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }

    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }
    
    await Role.findByIdAndDelete(id);
    
    return res.json({ 
      success: true,
      message: 'Role deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete role error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};