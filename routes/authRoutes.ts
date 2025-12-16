// src/routes/user.route.ts
import express from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    googleAuth,
    verifyEmail,     // NEW
    resendOTP,       // NEW
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.js';

const authRouter= express.Router();

// Authentication routes
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/google-auth', googleAuth);

// Email verification routes (NEW)
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/resend-otp', resendOTP);

// Protected routes
authRouter.get('/profile', authMiddleware, getCurrentUser);

export default authRouter;