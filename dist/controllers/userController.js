import User from '../models/User.js';
import { Role } from '../models/role.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendAdminCreatedUserEmail } from '../utils/email.service.js';
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchTerm = req.query.search;
        const statusFilter = req.query.status;
        const currentUserId = req.user?._id || req.user?.id;
        const query = {};
        if (currentUserId) {
            query._id = { $ne: currentUserId };
        }
        if (statusFilter) {
            query.status = statusFilter;
        }
        if (searchTerm) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            });
        }
        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -verificationToken -googleId')
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
    }
    catch (err) {
        console.error("Error occurred while fetching users:", err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: err.message
        });
    }
};
export const createUser = async (req, res) => {
    const { name, email, status, picture, role: roleId } = req.body;
    try {
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
        let permissions = [];
        if (roleId) {
            const existingRole = await Role.findById(roleId);
            if (!existingRole) {
                return res.status(400).json({ success: false, message: 'Role not found' });
            }
            permissions = existingRole.permissions;
        }
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
        const emailSent = await sendAdminCreatedUserEmail(email.toLowerCase().trim(), name, tempPassword);
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
    }
    catch (err) {
        console.error("Error occurred while creating user:", err);
        res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
    }
};
export const getUserById = async (req, res) => {
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
    }
    catch (err) {
        console.log("error occurred while fetching user:", err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: err.message
        });
    }
};
export const updateUser = async (req, res) => {
    const { name, email, status, picture, role: roleId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty'
                });
            }
            user.name = name.trim();
        }
        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
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
        if (status !== undefined) {
            if (status !== 'available' && status !== 'not available') {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be either "available" or "not available"'
                });
            }
            user.status = status;
        }
        if (picture !== undefined) {
            user.picture = picture;
        }
        if (roleId !== undefined) {
            if (roleId === null || roleId === '') {
                user.role = undefined;
                user.permissions = [];
            }
            else {
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
        await user.save();
        const updatedUser = await User.findById(user._id)
            .select('-password -verificationToken')
            .populate('role', 'name permissions')
            .lean();
        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    }
    catch (err) {
        console.log("error occurred while updating user:", err);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: err.message
        });
    }
};
export const deleteUser = async (req, res) => {
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
    }
    catch (err) {
        console.log("error occurred while deleting user:", err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: err.message
        });
    }
};
//# sourceMappingURL=userController.js.map