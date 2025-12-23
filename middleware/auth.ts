import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET: string = process.env.JWT_SECRET! || "your_jwt_secret_here";

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    return;
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    // Keep your original select; status is included by default.
    const user = await User.findById(payload.id)
      .select('-password') // exclude password
      .populate('role', 'name permissions');

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // 🚫 Block inactive users immediately
    if (user.status === 'not available') {
      res.status(403).json({
        success: false,
        message: 'Access Denied: Your account is currently suspended or inactive.', // used by client
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      permissions: user.permissions || [],
      roleId: user.role?._id?.toString()
    };

    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

export default authMiddleware;