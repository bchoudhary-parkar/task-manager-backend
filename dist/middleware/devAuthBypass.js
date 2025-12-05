export const devAuthBypass = (req, res, next) => {
    // Simulate logged-in admin for development
    req.user = {
        userId: 'admin_123',
        email: 'admin@example.com',
        roleId: 'admin',
        permissions: [1, 2, 3, 4] // All permissions
    };
    console.log('🔧 DEV MODE: Bypassing auth, user:', req.user);
    next();
};
//# sourceMappingURL=devAuthBypass.js.map