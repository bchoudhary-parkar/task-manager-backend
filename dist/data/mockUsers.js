// In-memory user storage - will reset on server restart
export let mockUsers = [
    {
        _id: 'user_001',
        name: 'John Doe',
        email: 'john@example.com',
        role: null, // Will be populated when assigned
        status: 'available',
        photoUrl: 'https://ui-avatars.com/api/?name=John+Doe'
    },
    {
        _id: 'user_002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: null,
        status: 'available',
        photoUrl: 'https://ui-avatars.com/api/?name=Jane+Smith'
    },
    {
        _id: 'user_003',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: null,
        status: 'not available',
        photoUrl: 'https://ui-avatars.com/api/?name=Bob+Wilson'
    },
    {
        _id: 'user_004',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: null,
        status: 'available',
        photoUrl: 'https://ui-avatars.com/api/?name=Alice+Brown'
    },
    {
        _id: 'user_005',
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        role: null,
        status: 'available',
        photoUrl: 'https://ui-avatars.com/api/?name=Charlie+Davis'
    }
];
// Helper to generate unique IDs
export const generateUserId = () => {
    const num = mockUsers.length + 1;
    return `user_${num.toString().padStart(3, '0')}`;
};
//# sourceMappingURL=mockUsers.js.map