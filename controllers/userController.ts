import { Request, Response } from 'express';
import User from '../models/User.js';
import { Role } from '../models/role.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; 
import { sendAdminCreatedUserEmail } from '../utils/email.service.js';

interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: 'available' | 'not available';
  };
}

export const getUsers = async (req: PaginatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search;
    const statusFilter = req.query.status;

    // 1. Get the current user's ID from the request object
    // This assumes your auth middleware attaches the user to req.user
    const currentUserId = (req as any).user?._id || (req as any).user?.id;

    // 2. Build the query object
    const query: any = {};
    
    // FILTER: Exclude the logged-in user from the results
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    // Add status filter if provided
    if (statusFilter) {
      query.status = statusFilter;
    }

    // Add search logic
    if (searchTerm) {
      // Use $and to ensure we keep the exclusion of the current user
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      });
    }

    // 3. Execute the query
    const totalUsers = await User.countDocuments(query);

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
    console.error("Error occurred while fetching users:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: err.message 
    });
  }
};


export const createUser = async (req: Request, res: Response) => {
  const { name, email, status, picture, role: roleId } = req.body;

  try {
    // 2. Validation
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex'); 
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    let permissions: number[] = [];
    if (roleId) {
      const existingRole = await Role.findById(roleId);
      if (!existingRole) {
        return res.status(400).json({ success: false, message: 'Role not found' });
      }
      permissions = existingRole.permissions;
    }

    // 5. Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      status: status || 'available',
      picture: picture || `ui-avatars.com{encodeURIComponent(name)}`,
      role: roleId || null,
      permissions,
      isGoogleAuth: false,
      emailVerified: false,
      isAdminCreated: true, 
      mustChangePassword: true 
    });

    const emailSent = await sendAdminCreatedUserEmail(
      email.toLowerCase().trim(), 
      name, 
      tempPassword
    );

    // if (emailSent) {
    //   console.log(`Temp password for ${email} sent to email.`);
    // } else {
    //   console.error(`User created but failed to send email to ${email}. Password was: ${tempPassword}`);
    // }

    // 7. Return populated user data
    const populatedUser = await User.findById(newUser._id)
      .select('-password -verificationToken -googleId')
      .populate('role', 'name permissions')
      .lean();
    
    res.status(201).json({
      success: true,
      data: populatedUser,
      message: emailSent 
        ? 'User created successfully and password emailed.' 
        : 'User created successfully, but email failed to send.'
    });

  } catch (err: any) {
    console.error("Error occurred while creating user:", err);
    res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};


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