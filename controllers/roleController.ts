import { Request, Response } from 'express';
import { Role } from '../models/role.js';
import { permissionsMap, validatePermissions } from '../constants/permissions.js';

// GET /permissions
export const getPermissions = (req: Request, res: Response) => {
  return res.json(permissionsMap);
};

// POST /roles - FIXED VERSION
export const createRole = async (req: Request, res: Response) => {
  try {
    let { name, permissions } = req.body;
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Name and permissions are required' });
    }

    // CHANGE: Only trim, don't convert case - preserve original case
    name = name.trim();
    
    // Validate permission codes
    if (!validatePermissions(permissions)) {
      return res.status(400).json({ message: 'Invalid permission codes' });
    }
    
    // Check if role already exists (case-insensitive comparison for duplicates only)
    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingRole) {
      return res.status(409).json({ message: 'Role already exists' });
    }

    // Save with original case preserved
    const newRole = await Role.create({ name, permissions });
    return res.status(201).json(newRole);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// GET /roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// GET /roles/:id
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// PUT /roles/:id - FIXED VERSION
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, permissions } = req.body;
    
    // Validate input
    if (!name && !permissions) {
      return res.status(400).json({ message: 'At least one field (name or permissions) is required' });
    }
    
    // Validate permissions if provided
    if (permissions && (!Array.isArray(permissions) || !validatePermissions(permissions))) {
      return res.status(400).json({ message: 'Invalid permission codes' });
    }
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check for duplicate name if name is being updated (case-insensitive)
    if (name) {
      name = name.trim();
      
      // Only check for duplicates if the name actually changed
      if (name.toLowerCase() !== role.name.toLowerCase()) {
        const existingRole = await Role.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        
        if (existingRole) {
          return res.status(409).json({ message: 'Role with this name already exists' });
        }
      }
      
      // Save with original case preserved
      role.name = name;
    }
    
    // Update permissions if provided
    if (permissions) {
      role.permissions = permissions;
    }
    
    const updatedRole = await role.save();
    return res.json(updatedRole);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// DELETE /roles/:id
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    await Role.findByIdAndDelete(id);
    return res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};