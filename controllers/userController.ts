import { Request, Response } from 'express';
import User from '../models/User.js';
import { Role } from '../models/role.js';
import bcrypt from 'bcrypt';

interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: 'available' | 'not available';
  };
}

// GET /api/users - Get all users with pagination and search
export const getUsers = async (req: PaginatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search;
    const statusFilter = req.query.status;

    // Build query
    const query: any = {};
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (statusFilter) {
      query.status = statusFilter;
    }

    // Get total count
    const totalUsers = await User.countDocuments(query);

    // Execute query with pagination and populate role
    const users = await User.find(query)
      .select('-password -verificationToken -googleId') // Exclude sensitive fields
      .populate('role', 'name permissions')
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
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

  } catch (err: any) {
    console.log("error occurred while fetching users:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: err.message 
    });
  }
};

// POST /api/users - Create new user
export const createUser = async (req: Request, res: Response) => {
  const { name, email, status, picture, role: roleId, password } = req.body;

  try {
    // 1. Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required' 
      });
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // 3. Check if email already exists
    const emailExists = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (emailExists) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }
    
    // 4. Password validation (for non-Google auth)
    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Validate role if provided
    let permissions: number[] = [];
    if (roleId) {
      const existingRole = await Role.findById(roleId);
      
      if (!existingRole) {
        return res.status(400).json({ 
          success: false,
          message: 'Role not found' 
        });
      }
      
      permissions = existingRole.permissions;
    }

    // 7. Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      status: status || 'available',
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      role: roleId || null,
      permissions,
      isGoogleAuth: false,
      emailVerified: false
    });

    // 8. Populate role and return (exclude password)
    const populatedUser = await User.findById(newUser._id)
      .select('-password -verificationToken')
      .populate('role', 'name permissions')
      .lean();
    
    res.status(201).json({
      success: true,
      data: populatedUser,
      message: 'User created successfully'
    });

  } catch (err: any) {
    console.log("error occurred while creating user:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create user',
      error: err.message 
    });
  }
};

// GET /api/users/:id - Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -googleId')
      .populate('role', 'name permissions')
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (err: any) {
    console.log("error occurred while fetching user:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user',
      error: err.message 
    });
  }
};

// PUT /api/users/:id - Update user
export const updateUser = async (req: Request, res: Response) => {
  const { name, email, status, picture, role: roleId } = req.body;

  try {
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Validate and update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ 
          success: false,
          message: 'Name cannot be empty' 
        });
      }
      user.name = name.trim();
    }

    // Validate and update email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email format' 
        });
      }

      // Check duplicate email (excluding current user)
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id }
      });
      
      if (emailExists) {
        return res.status(409).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }

      user.email = email.toLowerCase().trim();
    }

    // Update status
    if (status !== undefined) {
      if (status !== 'available' && status !== 'not available') {
        return res.status(400).json({ 
          success: false,
          message: 'Status must be either "available" or "not available"' 
        });
      }
      user.status = status;
    }

    // Update picture
    if (picture !== undefined) {
      user.picture = picture;
    }

    // Handle role update
    if (roleId !== undefined) {
      if (roleId === null || roleId === '') {
        // Remove role assignment
        user.role = undefined;
        user.permissions = [];
      } else {
        // Assign new role
        const roleDoc = await Role.findById(roleId);
        
        if (!roleDoc) {
          return res.status(400).json({ 
            success: false,
            message: 'Role not found' 
          });
        }
        
        user.role = roleDoc._id;
        user.permissions = roleDoc.permissions;
      }
    }

    // Save user (triggers pre-save middleware)
    await user.save();

    // Return populated user
    const updatedUser = await User.findById(user._id)
      .select('-password -verificationToken')
      .populate('role', 'name permissions')
      .lean();
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (err: any) {
    console.log("error occurred while updating user:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user',
      error: err.message 
    });
  }
};

// DELETE /api/users/:id - Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
      .select('-password -verificationToken');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: user,
      message: 'User deleted successfully' 
    });
    
  } catch (err: any) {
    console.log("error occurred while deleting user:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: err.message 
    });
  }
};